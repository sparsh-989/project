const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: "your_personal_access_token_here",
});

async function getPullRequestChanges() {
  try {
    const response = await octokit.pulls.listFiles({
      owner: "your_repo_owner",
      repo: "your_repo_name",
      pull_number: process.env.PULL_REQUEST_NUMBER,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching pull request changes:", error.message);
  }
}

module.exports = {
  getPullRequestChanges,
};
