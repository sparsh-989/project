const { Octokit } = require("@octokit/core");

const octokit = new Octokit({
  auth: "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",
});
const owner = "Sparsh-989"; // Replace with the repository owner's username
const repo = "project"; // Replace with the repository name
const fullCommitId = process.argv[2]; // Get the full commit ID from the command line argument
const commitId = fullCommitId.slice(0, 7); // Extract the first 7 characters of the commit ID



async function getUsernameByCommitId() {
  try {
    const response = await octokit.request("GET /repos/{owner}/{repo}/commits/{ref}", {
      owner,
      repo,
      ref: commitId,
    });

    if (response.data && response.data.author) {
      const username = response.data.author.login;
      console.log(`Author's username: ${username}`);
      getUserTypeByUsername(username);
    } else {
      console.log("Commit or author not found.");
    }
  } catch (error) {
    console.error("Error fetching commit data:", error.message);
  }
}

async function getUserTypeByUsername(username) {
  if (username === "actions-user") {
    console.log("The user is a bot.");
  } else {
    try {
      const response = await octokit.request("GET /users/{username}", {
        username,
      });

      if (response.data) {
        const userType = response.data.type;
        console.log(`User type: ${userType}`);
        if (userType === "Bot") {
          console.log("The user is a bot.");
        } else {
          console.log("The user is a human.");
        }
      } else {
        console.log("User not found.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message);
    }
  }
}

getUsernameByCommitId();

  


