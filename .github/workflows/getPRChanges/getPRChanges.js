
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
  console.log(`::set-env name=PR_CHANGES::${JSON.stringify(data.files)}`);
  console.log(`::set-env name=PULL_REQUEST_NUMBER::${data.pullRequestNumber}`);
});
