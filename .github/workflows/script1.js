const { exec } = require("child_process");
const fs = require("fs");

function allowedChangesCheck(oldObj, newObj, allowedChangesByHuman) {
  const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of keys) {
    const oldValue = oldObj[key];
    const newValue = newObj[key];

    if (oldValue !== newValue) {
      if (!allowedChangesByHuman.includes(key)) {
        return false;
      }
    }
  }
  return true;
}

(async () => {
  try {
    const commitId = process.argv[2];
    const userType = process.argv[3];

    // Read the old tsc.json file
    const oldTscJson = JSON.parse(fs.readFileSync("tsc.json"));

    // Checkout the latest version of tsc.json
    exec(`git checkout ${commitId} -- tsc.json`, (error) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }

      // Read the new tsc.json file
      const newTscJson = JSON.parse(fs.readFileSync("tsc.json"));

      const allowedChangesByHuman = ["linkedin", "slack", "twitter", "availableForHire"];

      let allowedChanges = true;

      outerLoop: for (let i = 0; i < oldTscJson.length; i++) {
        const oldObj = oldTscJson[i];
        const newObj = newTscJson[i];

        if (!allowedChangesCheck(oldObj, newObj, allowedChangesByHuman)) {
          allowedChanges = false;
          break;
        }
      }

      if (allowedChanges && userType === "human") {
        console.log("Valid changes.");
      } else if (!allowedChanges && userType === "bot") {
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
