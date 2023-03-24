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

execSync(`git checkout ${MAIN_BRANCH_REF}`);
const TSC_JSON_PATH = path.join(process.cwd(), "tsc.json");

// Check if the main branch exists
const branchExists = execSync(`git branch --list ${MAIN_BRANCH_REF}`, {
  encoding: "utf8",
}).trim().length > 0;

if (!branchExists) {
  console.error(`Main branch ${MAIN_BRANCH_REF} does not exist.`);
  process.exit(1);
}

// Switch back to the branch where changes were made
execSync(`git checkout -`);

// Read the codeowners file diff between the latest commit and the previous commit
const codeownersDiff = execSync(`git diff HEAD~1 HEAD -- ${CODEOWNERS_PATH}`, {
  encoding: "utf8",
});
console.log('codeownersDiff:', codeownersDiff);

// Read the content of the CODEOWNERS file
const codeowners = fs.readFileSync(CODEOWNERS_PATH, "utf8");
const lines = codeowners.split("\n");
const records = [];

for (const line of lines) {
  const parts = line.split("@");
  if (parts.length === 2) {
    const [repoName, ...rest] = parts[0].split("/");

    const githubid = parts[1].trim();
    records.push({ repoName, githubid });
  }
}

console.log(records);
console.log('CODEOWNERS file:', codeowners);

const regex = /^\+\s*(\w+)(?:\/\w+)*\s+@(\w+)/gm;
let match;

// Read the tsc.json file
execSync(`git checkout ${MAIN_BRANCH_REF}`);
const tscJson = JSON.parse(fs.readFileSync(TSC_JSON_PATH, "utf8"));
// Check if each github id from records is present in tsc.json
for (const record of records) {
  const githubid = record.githubid;
  let found = false;

  for (let i = 0; i < tscJson.length; i++) {
    if (tscJson[i].github === githubid) {
      found = true;

      // If the repoName is not already in the repos array of the member, add it
      if (!tscJson[i].repos.includes(record.repoName)) {
        tscJson[i].repos.push(record.repoName);
      }

      break;
    }
  }

  // If not found, add a new entry to tsc.json
  if (!found) {
    const newMember = {
      name: "",
      github: githubid,
      linkedin: "",
      slack: "",
      twitter: "",
      availableForHire: false,
      repos: [record.repoName],
    };
    tscJson.push(newMember);
  }
}

fs.writeFileSync(TSC_JSON_PATH, JSON.stringify(tscJson, null, 2));
