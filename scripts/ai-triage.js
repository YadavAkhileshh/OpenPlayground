const nlp = require('compromise');
const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function main() {
  const title = process.env.ISSUE_TITLE;
  const body = process.env.ISSUE_BODY;
  const issueNumber = process.env.ISSUE_NUMBER;
  const owner = process.env.REPO_OWNER;
  const repo = process.env.REPO_NAME;

  const text = `${title} ${body}`;

  // Analyze with NLP
  const doc = nlp(text);

  // Determine type
  let labels = [];
  let priority = 'low';
  let comment = '';

  // Check for bug
  if (doc.has('#Bug') || doc.has('bug') || doc.has('error') || doc.has('fix') || doc.has('broken')) {
    labels.push('bug');
  }

  // Check for enhancement
  if (doc.has('enhancement') || doc.has('feature') || doc.has('improve') || doc.has('add')) {
    labels.push('enhancement');
  }

  // Check for documentation
  if (doc.has('doc') || doc.has('documentation') || doc.has('readme') || doc.has('guide')) {
    labels.push('documentation');
  }

  // Check for good first issue
  if (doc.has('beginner') || doc.has('first issue') || doc.has('easy') || doc.has('simple')) {
    labels.push('good first issue');
  }

  // Determine priority
  if (doc.has('urgent') || doc.has('critical') || doc.has('high priority') || doc.has('asap')) {
    priority = 'high';
  } else if (doc.has('medium') || doc.has('important')) {
    priority = 'medium';
  }

  labels.push(`priority: ${priority}`);

  // Add component if mentioned
  const components = ['frontend', 'backend', 'ui', 'api', 'database'];
  components.forEach(comp => {
    if (doc.has(comp)) {
      labels.push(`component: ${comp}`);
    }
  });

  // Apply labels
  if (labels.length > 0) {
    await octokit.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels,
    });
  }

  // Add comment
  comment = `AI Triage: Assigned labels: ${labels.join(', ')}. Priority: ${priority}. Please review and override if needed.`;
  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body: comment,
  });

  console.log('Triage completed');
}

main().catch(console.error);