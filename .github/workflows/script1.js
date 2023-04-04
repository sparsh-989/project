const { exec } = require("child_process");

(async () => {
  try {
    const commitId = process.argv[2];
    const userType = process.argv[3];

    const allowedChangesByHuman = ["twitter", "slack", "linkedin", "availableForHire"];
    const allowedChangesByBot = ["name", "repos", "github"];

    exec(`git diff ${commitId}^!`, async (error, gitDiffOutput) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }

      const lines = gitDiffOutput.split("\n");
      const fieldCounts = new Map();

      for (const line of lines) {
        const fieldName = line.match(/"([a-zA-Z]+)":/)?.[1];
        if (fieldName) {
          fieldCounts.set(fieldName, (fieldCounts.get(fieldName) || 0) + 1);
        }
      }

      let allowedChanges = true;

      for (const [fieldName, count] of fieldCounts.entries()) {
        if (count >= 2) {
          console.log(`Change detected in '${fieldName}'`);

          if (userType === "human" && !allowedChangesByHuman.includes(fieldName)) {
            allowedChanges = false;
            break;
          } else if (userType === "bot" && !allowedChangesByBot.includes(fieldName)) {
            allowedChanges = false;
            break;
          }
        }
      }

      if (allowedChanges) {
        console.log("Valid changes.");
      } else {
        console.log("Invalid changes.");
      }
    });
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
})();
