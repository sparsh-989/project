const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Find the path to the modified CODEOWNERS file
const modifiedFiles = execSync("git diff-tree --no-commit-id --name-only -r HEAD", {
  encoding: "utf8",
});
const modifiedCodeowners = modifiedFiles
  .split("\n")
  .find((file) => file.endsWith("/CODEOWNERS"));

if (!modifiedCodeowners) {
  console.error("No modified CODEOWNERS file found.");
  process.exit(1);
}

const CODEOWNERS_PATH = process.env.CODEOWNERS_PATH;
console.log(`CODEOWNERS_PATH: ${CODEOWNERS_PATH}`);

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
const TSC_JSON_PATH = path.join(process.cwd(), "tsc.json");
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

fs.writeFileSync(TSC_JSON_PATH, JSON.stringify(tscJson
