const { exec } = require('child_process');

(async () => {
  try {
    const commitId = process.argv[2];

    // Fetch the necessary Git history
    exec(`git fetch --depth=2`, (fetchError) => {
      if (fetchError) {
        console.error(`Fetch Error: ${fetchError.message}`);
        return;
      }

      // Run git diff to show changes in tsc.json
      exec(`git diff ${commitId}^ ${commitId} -- tsc.json`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return;
        }

        if (stderr) {
          console.error(`Error: ${stderr}`);
          return;
        }

        console.log('Changes in tsc.json:');
        console.log(stdout);
      });
    });
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
