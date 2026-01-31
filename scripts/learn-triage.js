const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function main() {
  const issueNumber = process.env.ISSUE_NUMBER;
  const action = process.env.ACTION; // labeled or unlabeled
  const label = process.env.ADDED_LABEL || process.env.REMOVED_LABEL; // assuming env for removed too

  const owner = process.env.REPO_OWNER || 'Gupta-02'; // assuming
  const repo = process.env.REPO_NAME || 'OpenPlayground';

  // Get current labels
  const { data: issue } = await octokit.issues.get({
    owner,
    repo,
    issue_number: issueNumber,
  });

  const currentLabels = issue.labels.map(l => l.name);

  // Load data
  const dataPath = path.join(__dirname, 'triage-data.json');
  let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // For simplicity, just store the current state
  // In real learning, compare to predicted and update rules

  data.corrections.push({
    issue: issueNumber,
    title: issue.title,
    body: issue.body,
    labels: currentLabels,
    action,
    label,
  });

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

  console.log('Learning updated');
}

main().catch(console.error);