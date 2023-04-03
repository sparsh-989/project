const { exec } = require("child_process");
const fs = require("fs");

(async () => {
  try {
    const commitId = process.argv[2];
    const userType = process.argv[3];

    const allowedChangesByHuman = ["twitter", "slack", "linkedin", "availableForHire"];
    const allowedChangesByBot = ["name", "repos", "github"];

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
        if (oldTscJson[key] !== newTscJson[key]) {
          console.log(`Change detected in '${key}'`);
          console.log(`Old value: ${JSON.stringify(oldTscJson[key])}`);
          console.log(`New value: ${JSON.stringify(newTscJson[key])}`);

          if (key === "repos") {
            const oldReposSet = new Set(oldTscJson[key]);
            const newReposSet = new Set(newTscJson[key]);

            const hasReposChanges = [...oldReposSet].some(repo => !newReposSet.has(repo))
              || [...newReposSet].some(repo => !oldReposSet.has(repo));

            if (hasReposChanges && userType !== "bot") {
              allowedChanges = false;
              break;
            }
          } else {
            if (userType === "human" && !allowedChangesByHuman.includes(key)) {
              allowedChanges = false;
              break;
            } else if (userType === "bot" && !allowedChangesByBot.includes(key)) {
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
