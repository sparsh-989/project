const { exec } = require("child_process");
const fs = require("fs");

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
      const oldTscJson = JSON.parse(fs.readFileSync("tsc.json"));
      const newTscJson = JSON.parse(fs.readFileSync("tsc.json"));

      // Parse the diff and check which properties have changed
      changes.split("\n").forEach(line => {
        if (line.startsWith("+")) {
          const [key, value] = line.substring(1).split(":");
          newTscJson[key.trim()] = value.trim();
        } else if (line.startsWith("-")) {
          const [key, value] = line.substring(1).split(":");
          oldTscJson[key.trim()] = value.trim();
        }
      });

      let allowedChanges = true;

      // Check which properties have changed and if they are allowed changes
      for (const key of Object.keys(newTscJson)) {
        if (oldTscJson[key] !== newTscJson[key]) {
          console.log(`Change detected in '${key}'`);

          if (key === "repos") {
            const oldReposSet = new Set(oldTscJson[key]);
            const newReposSet = new Set(newTscJson[key]);

            const hasReposChanges = [...oldReposSet].some(repo => !newReposSet.has(repo))
              || [...newReposSet].some(repo => !oldReposSet.has(repo));

            if (hasReposChanges && userType !== "bot") {
              allowedChanges = false;
              break;
            }
          } else if (userType === "human" && !allowedChangesByHuman.includes(key)) {
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
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
})();
