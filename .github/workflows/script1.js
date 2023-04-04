const { exec } = require("child_process");

(async () => {
  try {
    const commitId = process.argv[2];
    const userType = process.argv[3];

    const allowedChangesByHuman = ["twitter", "slack", "linkedin", "availableForHire"];
    const allowedChangesByBot = ["name", "repos", "github"];

    exec(`git diff ${commitId}^! --word-diff`, async (error, gitDiffOutput) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }

      const lines = gitDiffOutput.split("\n");

      const changes = new Set();
      let allowedChanges = true;

      for (const line of lines) {
        if (line.startsWith("[-") || line.startsWith("{+")) {
          const fieldName = line.match(/"([^"]+)"/)?.[1];

          if (fieldName && !changes.has(fieldName)) {
            console.log(`Change detected in '${fieldName}'`);
            changes.add(fieldName);

            if (userType === "human" && !allowedChangesByHuman.includes(fieldName)) {
              allowedChanges = false;
              break;
            } else if (userType === "bot" && !allowedChangesByBot.includes(fieldName)) {
              allowedChanges = false;
              break;
            }
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
