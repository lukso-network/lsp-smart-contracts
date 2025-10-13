import { AsyncFunctionArguments } from '@actions/github-script';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface Issue {
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning';
  message: string;
}

export function parseOutput() {
  // Read raw output from file
  const resultsPath = join(process.env.GITHUB_WORKSPACE || './', 'solhint-output.txt');
  if (!existsSync(resultsPath)) console.error('No lint file found.');
  const rawOutput = readFileSync(resultsPath, 'utf8');

  // Split into lines
  const lines = rawOutput.split('\n');

  // Track issues by package: { '@lukso/lsp6-contracts': [ ... ] }
  const issuesByPackage = new Map<string, Issue[]>();

  for (const line of lines) {
    // Skip empty or non-relevant lines
    if (!line.trim()) continue;
    if (line.includes('cache miss, executing')) continue;
    if (line.includes('A new version of Solhint is available')) continue;
    if (line.includes('Remote caching disabled')) continue;
    if (line.includes('Running lint:solidity in')) continue;
    if (line.includes('Packages in scope:')) continue;

    // Detect package name
    const pkgMatch = line.match(/@lukso\/[a-zA-Z0-9\-]+/);
    const currentPackage = pkgMatch && pkgMatch[0];
    if (!currentPackage) continue;

    // Skip lines without file paths or errors
    if (!line.includes('contracts/') && !line.includes('.sol')) continue;

    // Match error/warning: "   5:1  warning  Import in ..." or "✖ N problems"
    const issueMatch = line.match(/(\d+):(\d+)\s+(error|warning)\s+(.+)$/i);
    if (issueMatch) {
      const [, lineNum, col, type, msg] = issueMatch;
      const file = currentPackage ? `${currentPackage}/contracts` : 'unknown';

      const issue = {
        file: file,
        line: parseInt(lineNum),
        column: parseInt(col),
        severity: type === 'error' ? 'error' : 'warning',
        message: msg.trim(),
      } satisfies Issue;

      if (issuesByPackage.has(currentPackage)) {
        issuesByPackage.get(currentPackage)!.push(issue);
      } else {
        issuesByPackage.set(currentPackage, [issue]);
      }
    }
  }

  // Prepare comment body
  let body = '# 📝 Solidity Lint Report\n';
  let hasIssues = false;

  for (const [pkg, issues] of issuesByPackage.entries()) {
    if (issues.length === 0) continue;

    body += `\n---\n`;
    body += `<details>\n`;
    body += `<summary><h2>📦 ${pkg}</h2></summary>\n`;

    for (const issue of issues) {
      const emoji = issue.severity === 'error' ? '❌' : '⚠️';
      const label = issue.severity.toUpperCase();
      body += `\n#### ${emoji} **${label}** in \`${issue.file}\` at line \`${issue.line}\`, column \`${issue.column}\``;
      body += `\n> ${issue.message}\n`;
    }

    body += `</details>\n`;

    // Add summary
    const errorsCount = issues.filter(({ severity }) => severity === 'error').length;
    const warningsCount = issues.filter(({ severity }) => severity === 'warning').length;
    body += `\n#### 💡 ✖ ${issues.length} problems (${errorsCount} errors, ${warningsCount} warnings)`;

    hasIssues = true;
  }

  if (!hasIssues) {
    body += '\n✅ No lint issues found! 🎉';
  } else {
    body += `\n---\n`;
    body += `\n> ❗ **Please fix the above linting errors before merging.**`;
  }

  return body;
}

export async function githubScript({ github, context }: AsyncFunctionArguments) {
  const body = parseOutput();

  // Get PR context
  const owner = context.repo.owner;
  const repo = context.repo.repo;
  const prNumber = context.payload.pull_request?.number;

  if (!prNumber) {
    console.error('Missing PR number');
    return;
  }

  // Find existing comment with "Lint Report"
  let existingCommentId = null;
  try {
    const { data: comments } = await github.rest.issues.listComments({
      owner,
      repo,
      issue_number: prNumber,
    });

    const match = comments.find((c) => c.body && c.body.includes('# 📝 Solidity Lint Report'));
    if (match) {
      existingCommentId = match.id;
    }
  } catch (err: any) {
    if ('message' in err) {
      console.error('Error fetching comments:', err.message);
    } else {
      console.error('Error fetching comments:', err);
    }
  }

  // Update or create comment
  if (existingCommentId) {
    await github.rest.issues.updateComment({
      owner,
      repo,
      comment_id: existingCommentId,
      body,
    });
    console.log(`✅ Updated existing lint comment.`);
  } else {
    const { data } = await github.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body,
    });
    console.log(`✅ Created new lint comment (ID: ${data.id}).`);
  }
}
