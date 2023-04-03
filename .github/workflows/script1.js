const { exec } = require("child_process");
const fs = require("fs");

function isEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    const val1 = obj1[key];
    const val2 = obj2[key];
    const areObjects = isObject(val1) && isObject(val2);

    if (
      (areObjects && !isEqual(val1, val2)) ||
      (!areObjects && val1 !== val2)
    ) {
      return false;
    }
  }

  return true;
}

function isObject(obj) {
  return obj != null && typeof obj === 'object';
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
        const oldKeys = Object.keys(oldObj);

        for (const key of oldKeys) {
          if (!allowedChangesByHuman.includes(key)) {
            const tempOldObj = { ...oldObj };
            const tempNewObj = { ...newObj };

            delete tempOldObj[key];
            delete tempNewObj[key];

            if (!isEqual(tempOldObj, tempNewObj)) {
              allowedChanges = false;
              break outerLoop;
            }
          }
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
