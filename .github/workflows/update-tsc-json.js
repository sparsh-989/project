const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const CODEOWNERS_PATH = path.join(process.env.GITHUB_WORKSPACE, process.argv[2]);
const MAIN_BRANCH_REF = "refs/heads/main";
console.log(`CODEOWNERS_PATH: ${CODEOWNERS_PATH}`);

// Checkout the main branch and get the path to tsc.json
execSync(`git checkout ${MAIN_BRANCH_REF}`);
const TSC_JSON_PATH = path.join(process.cwd(), "tsc.json");

// Switch back to the branch where changes were made
execSync(`git checkout -`);

// Read the codeowners file diff between the latest commit and the previous commit
const codeownersDiff = execSync(`git diff HEAD~1 HEAD -- ${CODEOWNERS_PATH}`, {
  encoding: "utf8",
});
console.log('codeownersDiff:', codeownersDiff);

// Read the content of the CODEOWNERS file
const codeowners = fs.readFileSync(CODEOWNERS_PATH, "utf8");
console.log('CODEOWNERS file:', codeowners);

const regex = /^\+\s*(\w+)(?:\/\w+)*\s+@(\w+)/gm;
let match;

// Read the tsc.json file
const tscJson = JSON.parse(fs.readFileSync(TSC_JSON_PATH, "utf8"));

// Iterate through the added lines in the codeowners file and update tsc.json
while ((match = regex.exec(codeownersDiff)) !== null) {
  console.log('Match found:', match);
  const repoName = match[1];
  const githubUsername = match[2];

  let userIndex = tscJson.findIndex((user) => user.github === githubUsername);

  // If the user is not found in tsc.json, add the user with the new repo and blank slack and twitter fields
  if (userIndex === -1) {
    console.log('Adding new user:', githubUsername);
    tscJson.push({
      github: githubUsername,
      slack: "",
      twitter: "",
      repos: [repoName],
    });
  } else if (!tscJson[userIndex].repos.includes(repoName)) {
    console.log('Adding repo to existing user:', githubUsername);
    tscJson[userIndex].repos.push(repoName);
  }
}

fs.writeFileSync(TSC_JSON_PATH, JSON.stringify(tscJson, null, 2));
