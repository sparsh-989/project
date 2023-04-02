const { exec } = require('child_process');
const fs = require('fs');

(async () => {
  try {
    const commitId = process.argv[2];

    // Fetch the necessary Git history
    exec(`git fetch --depth=2`, (fetchError) => {
      if (fetchError) {
        console.error(`Fetch Error: ${fetchError.message}`);
        return;
      }

      // Checkout the previous version of tsc.json
      exec(`git checkout ${commitId}^ -- tsc.json`, (error) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return;
        }

        // Read the old tsc.json file
        const oldTscJson = JSON.parse(fs.readFileSync('tsc.json'));

        // Checkout the latest version of tsc.json
        exec(`git checkout ${commitId} -- tsc.json`, (error) => {
          if (error) {
            console.error(`Error: ${error.message}`);
            return;
          }

          // Read the new tsc.json file
          const newTscJson = JSON.parse(fs.readFileSync('tsc.json'));

          const allowedChangesByHuman = ['linkedin', 'slack', 'twitter', 'availableForHire'];

          let allowedChanges = true;

          outerLoop: for (let i = 0; i < Math.max(oldTscJson.length, newTscJson.length); i++) {
            const oldEntry = oldTscJson[i] || {};
            const newEntry = newTscJson[i] || {};

            for (const key in { ...oldEntry, ...newEntry }) {
              const isAllowedChange = allowedChangesByHuman.includes(key);
              const isNewAddition = !oldEntry[key];
              const isDeletion = !newEntry[key];

              if (
                (!isNewAddition && !isDeletion && oldEntry[key] !== newEntry[key] && !isAllowedChange) ||
                (isDeletion && isAllowedChange)
              ) {
                allowedChanges = false;
                break outerLoop;
              }
            }
          }

          if (allowedChanges) {
            console.log('Changes made by a human are allowed.');
          } else {
            console.log('Changes should be made by a bot.');
          }
        });
      });
    });
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
