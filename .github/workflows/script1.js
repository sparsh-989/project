const { exec } = require("child_process");
const fs = require("fs");

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

      outerLoop: for (let i = 0; i < newTscJson.length; i++) {
      for (const key in newTscJson[i]) {
    if (
      (!oldTscJson[i].hasOwnProperty(key) && !allowedChangesByHuman.includes(key)) ||
      (oldTscJson[i][key] !== newTscJson[i][key] && !allowedChangesByHuman.includes(key))
    ) {
      allowedChanges = false;
      break outerLoop;
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
