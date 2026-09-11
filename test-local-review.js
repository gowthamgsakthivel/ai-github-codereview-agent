#!/usr/bin/env node
/**
 * Test Local Code Review Script
 * Usage: node test-local-review.js [optional_pr_number]
 */

const fs = require('fs');
const path = require('path');

// Load .env if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length > 0) {
      process.env[key.trim()] = vals.join('=').trim();
    }
  });
}

const GITHUB_PAT = process.env.GITHUB_PAT;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GITHUB_REPO = process.env.GITHUB_REPO || 'gowthamgsakthivel/ai-github-codereview-agent';

async function reviewPR(prNumber) {
  if (!GEMINI_API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/ and put it in .env');
    process.exit(1);
  }

  let diffText = '';
  let prTitle = 'Local Demo Code Review';
  let prAuthor = 'developer';

  if (prNumber && GITHUB_PAT) {
    console.log(`📡 Fetching PR #${prNumber} diff from GitHub (${GITHUB_REPO})...`);
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/pulls/${prNumber}`, {
      headers: {
        'Accept': 'application/vnd.github.v3.diff',
        'Authorization': `Bearer ${GITHUB_PAT}`,
        'User-Agent': 'AI-Code-Review-Agent'
      }
    });

    if (!res.ok) {
      console.error(`❌ Failed to fetch PR diff: ${res.status} ${res.statusText}`);
      process.exit(1);
    }
    diffText = await res.text();
  } else {
    console.log('🧪 Running in local mock mode on samples/vulnerable-auth.js...');
    const sampleCode = fs.readFileSync(path.join(__dirname, 'samples/vulnerable-auth.js'), 'utf8');
    diffText = `+++ b/samples/vulnerable-auth.js\n${sampleCode.split('\n').map(l => '+' + l).join('\n')}`;
  }

  console.log(`🤖 Sending diff (${diffText.length} chars) to Gemini AI for review...`);

  const prompt = `You are a Senior Principal Software Architect and Cybersecurity Specialist conducting an automated Pull Request code review.

### PR Context:
- **Repository:** ${GITHUB_REPO}
- **PR:** ${prTitle}
- **Author:** @${prAuthor}

### Git Diff:
\`\`\`diff
${diffText}
\`\`\`

### Instructions:
Analyze the diff thoroughly across these 3 key pillars:
1. 🐞 **Bugs & Edge Cases**: Logic errors, unhandled null/undefined, race conditions, async/await mistakes.
2. 🛡️ **Security & Secrets**: Hardcoded credentials, SQL/Command/XSS injection vulnerabilities, improper sanitization.
3. 💎 **Code Quality & Best Practices**: Performance bottlenecks, readability, DRY violations, clean architecture.

Output a clean, structured GitHub Flavored Markdown report with verdict (Approved / Request Changes / Critical Security Flaw), scorecard, detailed findings with code blocks, and recommendations.`;

  const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 2048 }
    })
  });

  const data = await geminiRes.json();
  if (data.error) {
    console.error('❌ Gemini Error:', data.error.message);
    return;
  }

  const review = data.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log('\n=================== 🤖 AI REVIEW OUTPUT ===================\n');
  console.log(review);
  console.log('\n===========================================================\n');
}

const targetPR = process.argv[2];
reviewPR(targetPR);
