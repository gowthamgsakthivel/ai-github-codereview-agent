/**
 * Core AI Code Review Engine powered by Google Gemini API
 */

export async function generateCodeReview({
  diff,
  prTitle = 'Code Review Request',
  prBody = '',
  prAuthor = 'developer',
  repoFullName = 'repository'
}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }

  // Cap diff length to prevent context overflow while keeping rich context
  const MAX_DIFF_CHARS = 30000;
  let formattedDiff = diff || '';
  let isTruncated = false;

  if (formattedDiff.length > MAX_DIFF_CHARS) {
    formattedDiff = formattedDiff.substring(0, MAX_DIFF_CHARS) + '\n\n...[DIFF TRUNCATED DUE TO SIZE]...';
    isTruncated = true;
  }

  const systemInstruction = `You are a Senior Principal Software Architect and Lead Security Engineer conducting an automated Pull Request review.
Your mission is to perform a meticulous, high-signal, and constructive code review.`;

  const prompt = `Analyze the following Pull Request diff and provide an actionable code review.

### Pull Request Information:
- **Repository:** ${repoFullName}
- **Title:** ${prTitle}
- **Author:** @${prAuthor}
- **Description:** ${prBody || 'No description provided.'}

### Git Diff:
\`\`\`diff
${formattedDiff}
\`\`\`

### Review Framework:
Examine the changes across these 3 key pillars:
1. 🐞 **Bugs & Edge Cases**: Logic errors, unhandled null/undefined, race conditions, async/await mistakes, edge case failures.
2. 🛡️ **Security & Secrets**: Hardcoded credentials/tokens, SQL/Command/XSS injection vulnerabilities, missing sanitization, authentication bypasses, IDOR.
3. 💎 **Code Quality & Architecture**: Performance bottlenecks, readability, DRY violations, error handling, clean naming.

### Markdown Output Requirements:
Format your review strictly in GitHub Flavored Markdown:

1. **Header & Executive Summary**:
   - 🎯 1-2 sentence overview of what this PR does.
2. **Review Verdict**:
   - One of: \`✅ Approved\`, \`⚠️ Request Changes (Minor Issues)\`, or \`❌ Critical Security / Logic Flaws\`.
3. **Scorecard**:
   | Pillar | Score | Status |
   | :--- | :--- | :--- |
   | 🐞 Bug Risk | X / 10 | Status |
   | 🛡️ Security | Y / 10 | Status |
   | 💎 Quality | Z / 10 | Status |
4. **Detailed Findings**:
   - Group by file and line reference.
   - Clearly explain *why* it is an issue.
   - Provide concrete fix recommendations with code / diff blocks.
5. **Key Recommendations**:
   - Concise bullet list of immediate action items.

Keep the review helpful, precise, and professional.`;

  // Try Gemini 1.5 Flash (free tier)
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\n${prompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2500
      }
    })
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const errorMsg = data.error?.message || `Gemini API returned status ${response.status}`;
    throw new Error(`Gemini Review Failed: ${errorMsg}`);
  }

  const reviewContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!reviewContent) {
    throw new Error('No review response received from Gemini model.');
  }

  return {
    reviewMarkdown: reviewContent,
    isTruncated,
    timestamp: new Date().toISOString()
  };
}
