const fs = require('fs');
const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
    auth: "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",
});

async function getPullRequestChanges() {
  try {
    const response = await octokit.pulls.listFiles({
      owner: "sparsh-989",
      repo: "project",
      pull_number: process.env.PULL_REQUEST_NUMBER,
    });
     if (!response.data) {
      console.error("Error fetching pull request changes: Response data is undefined");
      return;
    }
    return {
      pullRequestNumber: process.env.PULL_REQUEST_NUMBER,
      files: response.data,
    };
  } catch (error) {
    console.error("Error fetching pull request changes:", error.message);
  }
}

getPullRequestChanges().then((data) => {
  console.log(JSON.stringify(data));
  if (!data) {
    console.error("No data returned from getPullRequestChanges()");
    return;
  }
  if (!data.files || data.files.length === 0) {
    console.warn("No files were changed in the pull request.");
    return;
  }
  fs.writeFileSync('pr_changes.json', JSON.stringify(data.files));
  fs.writeFileSync('pull_request_number.txt', data.pullRequestNumber.toString());
}).catch((error) => {
  console.error("Error running getPullRequestChanges():", error);
});
