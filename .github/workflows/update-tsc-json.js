const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const MAIN_BRANCH_REF = "main";

// Find the path to the modified CODEOWNERS file
const modifiedFiles = execSync("git diff --name-only HEAD~1 HEAD", {
  encoding: "utf8",
});
const modifiedCodeowners = modifiedFiles
  .split("\n")
  .find((file) => file.endsWith("CODEOWNERS"));

if (!modifiedCodeowners) {
  console.error("No modified CODEOWNERS file found.");
  process.exit(1);
}

const CODEOWNERS_PATH = modifiedCodeowners;
console.log(`CODEOWNERS_PATH: ${CODEOWNERS_PATH}`);

// Read the tsc.json file from the main branch
const tscJsonContent = execSync(`git show ${MAIN_BRANCH_REF}:tsc.json`, {
  encoding: "utf8",
});
const tscJson = JSON.parse(tscJsonContent);

// Read the codeowners file diff between the latest commit and the previous commit
const codeownersDiff = execSync(`git diff HEAD~1 HEAD -- ${CODEOWNERS_PATH}`, {
  encoding: "utf8",
});
console.log('codeownersDiff:', codeownersDiff);

const regex = /^\+\s*(\w+)(?:\/\w+)*\s+@(\w+)/gm;
let match;

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

// Checkout the main branch, update the tsc.json file, and switch back to the current branch
execSync(`git checkout ${MAIN_BRANCH_REF}`);
fs.writeFileSync("tsc.json", JSON.stringify(tscJson, null, 2));
execSync(`git checkout -`);
