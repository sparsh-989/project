const { exec } = require("child_process");
const fs = require("fs");

(async () => {
  try {
    const commitId = process.argv[2];
    const userType = process.argv[3];

    // Read the old tsc.json file
    const oldTscJson = JSON.parse(fs.readFileSync("tsc.json"));

    // Allowed changes for different user types
    const allowedChangesByHuman = ["linkedin", "slack", "twitter", "availableForHire"];
    const allowedChangesByBot = ["name", "repo", "githubid"];

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

        for (const line of lines) {
          if (line.startsWith('+') && line.includes(':')) {
            const key = line.split(':')[0].trim().slice(2, -1);

            if (userType === "human" && !allowedChangesByHuman.includes(key)) {
              allowedChanges = false;
              break;
            } else if (userType === "bot" && !allowedChangesByBot.includes(key)) {
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
