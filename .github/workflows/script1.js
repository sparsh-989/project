const { exec } = require("child_process");

const allowedChangesByHuman = ["twitter", "slack", "linkedin", "availableForHire"];
const allowedChangesByBot = ["name", "repos", "github"];

(async () => {
  try {
    const commitId = process.argv[2];
    const userType = process.argv[3];

    exec(`git diff ${commitId} ${commitId}^ -- tsc.json`, async (error, stdout) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }

      const changes = stdout.toString();
      let allowedChanges = true;

      // Parse the diff and check which properties have changed
      changes.split("\n").forEach(line => {
        if (line.startsWith("+++") || line.startsWith("---")) {
          return; // Ignore header lines
        }

        if (line.startsWith("+") || line.startsWith("-")) {
          const [key, value] = line.substring(1).split(":").map(str => str.trim());

          if (line.startsWith("+")) {
            console.log(`Change detected in '${key}'`);

            if (userType === "human" && !allowedChangesByHuman.includes(key)) {
              allowedChanges = false;
            } else if (userType === "bot" && !allowedChangesByBot.includes(key)) {
              allowedChanges = false;
            }
          }

          if (!allowedChanges) {
            console.log(`Invalid change detected: ${line}`);
            return;
          }
        }
      });

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
