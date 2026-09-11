/**
 * GitHub API Helper functions
 */

export async function fetchPullRequestDiff(repoFullName, prNumber) {
  const token = process.env.GITHUB_PAT;
  if (!token) {
    throw new Error('GITHUB_PAT is not set in environment variables.');
  }

  const url = `https://api.github.com/repos/${repoFullName}/pulls/${prNumber}`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3.diff',
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'AI-GitHub-Code-Review-Agent'
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch PR diff from GitHub (${res.status} ${res.statusText})`);
  }

  return await res.text();
}

export async function postPullRequestComment(repoFullName, prNumber, commentBody) {
  const token = process.env.GITHUB_PAT;
  if (!token) {
    throw new Error('GITHUB_PAT is not set in environment variables.');
  }

  const url = `https://api.github.com/repos/${repoFullName}/issues/${prNumber}/comments`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'AI-GitHub-Code-Review-Agent'
    },
    body: JSON.stringify({
      body: commentBody
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to post comment to GitHub PR (${res.status}): ${errText}`);
  }

  return await res.json();
}

export async function checkGitHubTokenStatus() {
  const token = process.env.GITHUB_PAT;
  if (!token) return { valid: false, reason: 'Token missing' };

  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'AI-GitHub-Code-Review-Agent'
      }
    });

    if (res.ok) {
      const user = await res.json();
      return { valid: true, username: user.login };
    }
    return { valid: false, reason: `GitHub returned ${res.status}` };
  } catch (err) {
    return { valid: false, reason: err.message };
  }
}
