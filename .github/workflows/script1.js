const { exec } = require("child_process");
const fs = require("fs");

(async () => {
  try {
    const commitId = process.argv[2];
    const userType = process.argv[3];

    const allowedChangesByHuman = ["linkedin", "slack", "twitter", "availableForHire", "repos"];
    const disallowedChangesByHuman = ["name", "github"];
    const allowedChangesByBot = ["name", "repos", "github"];
    const disallowedChangesByBot = ["linkedin", "slack", "twitter", "availableForHire"];

    // Get the tsc.json content from the specified commit
    exec(`git show ${commitId}:tsc.json`, async (error, oldTscJsonContent) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }

      const oldTscJson = JSON.parse(oldTscJsonContent);

      // Read the new tsc.json file (current working copy)
      const newTscJson = JSON.parse(fs.readFileSync("tsc.json"));

      let allowedChanges = true;

      const keys = new Set([...Object.keys(oldTscJson), ...Object.keys(newTscJson)]);

      for (const key of keys) {
        if (key === "repos") {
          const oldReposSet = new Set(oldTscJson[key]);
          const newReposSet = new Set(newTscJson[key]);

          const hasReposChanges = [...oldReposSet].some(repo => !newReposSet.has(repo))
            || [...newReposSet].some(repo => !oldReposSet.has(repo));

          if (hasReposChanges) {
            if (userType === "human" && disallowedChangesByHuman.includes(key)) {
              allowedChanges = false;
              console.log("Valid a.");
              break;
            } else if (userType === "bot" && disallowedChangesByBot.includes(key)) {
              allowedChanges = false;
              console.log("Valid b.");
              break;
            }
          }
        } else if (oldTscJson[key] !== newTscJson[key]) {
           console.log("Valid x.");
          if (userType === "human" && disallowedChangesByHuman.includes(key)) {
            allowedChanges = false;
            console.log("Valid c.");
            break;
          } else if (userType === "bot" && disallowedChangesByBot.includes(key)) {
            allowedChanges = false;
            console.log("Valid d.");
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

