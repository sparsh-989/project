const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CODEOWNERS_PATH = process.argv[2];
const MAIN_BRANCH_REF = 'refs/heads/main';

// Checkout the main branch and get the path to tsc.json
execSync(`git checkout ${MAIN_BRANCH_REF}`);
const TSC_JSON_PATH = path.join(process.cwd(), 'tsc.json');

// Switch back to the branch where changes were made
execSync(`git checkout -`);

// Read the codeowners file diff between the latest commit and the previous commit
const codeownersDiff = execSync(`git diff HEAD~1 HEAD -- ${CODEOWNERS_PATH}`, { encoding: 'utf8' });
const regex = /^\+\s*(\w+)(?:\/\w+)*\s+@(\w+)/gm;
let match;

// Read the tsc.json file
const tscJson = JSON.parse(fs.readFileSync(TSC_JSON_PATH, 'utf8'));

// Iterate through the added lines in the codeowners file and update tsc.json
while ((match = regex.exec(codeownersDiff)) !== null) {
  const repoName = match[1];
  const githubUsername = match[2];

  const userIndex = tscJson.findIndex((user) => user.github === githubUsername);

  if (userIndex !== -1 && !tscJson[userIndex].repos.includes(repoName)) {
    tscJson[userIndex].repos.push(repoName);
  }
}

fs.writeFileSync(TSC_JSON_PATH, JSON.stringify(tscJson, null, 2));
