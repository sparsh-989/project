const { exec } = require('child_process');

(async () => {
  try {
    const commitId = process.argv[2];
    const allowedChangesByHuman = ['linkedin', 'slack', 'twitter', 'availableForHire'];

    exec(`git diff ${commitId}^ ${commitId} -- tsc.json`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(`Error: ${stderr}`);
        return;
      }

      const diffLines = stdout.split('\n');
      let allowedChanges = true;

      for (const line of diffLines) {
        if (line.startsWith('+') || line.startsWith('-')) {
          const match = line.match(/"([^"]+)":/);
          if (match && match[1] && !allowedChangesByHuman.includes(match[1])) {
            allowedChanges = false;
            break;
          }
        }
      }

      if (allowedChanges) {
        console.log('Changes made by a human are allowed.');
      } else {
        console.log('Changes should be made by a bot.');
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
