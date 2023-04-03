const { exec } = require("child_process");
const fs = require("fs");

(async () => {
  try {
    const commitId = process.argv[2];
    const userType = process.argv[3];

    const allowedChangesByHuman = ["linkedin", "slack", "twitter", "availableForHire"];
    const disallowedChangesByHuman = ["name", "github", "repos"];
    const allowedChangesByBot = ["name", "repos", "github"];
    const disallowedChangesByBot = ["linkedin", "slack", "twitter", "availableForHire"];

    // Checkout the latest version of tsc.json
    exec(`git checkout ${commitId} -- tsc.json`, async (error) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }

      // Read the new tsc.json file
      const newTscJson = JSON.parse(fs.readFileSync("tsc.json"));

      // Get the git diff output for tsc.json
      exec(`git diff ${commitId} HEAD -- tsc.json`, (error, stdout) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return;
        }

        const gitDiffOutput = stdout;

        let allowedChanges = true;
        const lines = gitDiffOutput.split('\n');

        const modifiedKeys = lines
          .filter(line => line.startsWith('+') && line.includes(':'))
          .map(line => line.match(/^\+?"?(\w+)"?:/)[1]);

        if (userType === "human") {
          for (const key of modifiedKeys) {
            if (disallowedChangesByHuman.includes(key)) {
              allowedChanges = false;
              break;
            }
          }
        } else if (userType === "bot") {
          for (const key of modifiedKeys) {
            if (disallowedChangesByBot.includes(key)) {
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
    });
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
})();
