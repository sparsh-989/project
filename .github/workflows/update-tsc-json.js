const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CODEOWNERS_PATH = path.join(process.cwd(), 'CODEOWNERS');
const TSC_JSON_PATH = path.join(process.cwd(), 'tsc.json');

const tscJson = require(TSC_JSON_PATH);

const getLatestCommitDiff = () => {
  return execSync('git diff HEAD^ HEAD -- CODEOWNERS', { encoding: 'utf8' });
};

const codeownersDiff = getLatestCommitDiff();
const regex = /^\+\s*(\w+)(?:\/\w+)*\s+@(\w+)/gm;
let match;
console.log(match)
while ((match = regex.exec(codeownersDiff)) !== null) {
  const repoName = match[1];
  const githubUsername = match[2];

  const userIndex = tscJson.findIndex((user) => user.github === githubUsername);
  console.log(userindex)

  if (userIndex === -1) {
    process.exit(0);
  }

  if (!tscJson[userIndex].repos.includes(repoName)) {
    tscJson[userIndex].repos.push(repoName);
  }
}

fs.writeFileSync(TSC_JSON_PATH, JSON.stringify(tscJson, null, 2));
