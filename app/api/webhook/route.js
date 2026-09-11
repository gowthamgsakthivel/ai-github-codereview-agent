import { NextResponse } from 'next/server';
import { fetchPullRequestDiff, postPullRequestComment } from '@/lib/github';
import { generateCodeReview } from '@/lib/reviewer';

export async function POST(request) {
  try {
    const payload = await request.json();

    // Verify this is a pull_request event
    if (!payload.pull_request) {
      return NextResponse.json(
        { message: 'Event ignored: Not a Pull Request payload.' },
        { status: 200 }
      );
    }

    const { action, pull_request: pr, repository: repo } = payload;
    const supportedActions = ['opened', 'synchronize', 'reopened'];

    if (!supportedActions.includes(action)) {
      return NextResponse.json(
        { message: `Action '${action}' ignored. Only reviewing on: ${supportedActions.join(', ')}` },
        { status: 200 }
      );
    }

    const repoFullName = repo.full_name;
    const prNumber = pr.number;
    const prTitle = pr.title;
    const prBody = pr.body || '';
    const prAuthor = pr.user?.login || 'developer';

    console.log(`🤖 [Agent Triggered] Reviewing PR #${prNumber} in ${repoFullName}...`);

    // 1. Fetch raw PR diff from GitHub
    const diff = await fetchPullRequestDiff(repoFullName, prNumber);

    if (!diff || diff.trim().length === 0) {
      console.log(`ℹ️ [Agent] PR #${prNumber} has no changed lines in diff.`);
      return NextResponse.json({ message: 'PR has empty diff.' }, { status: 200 });
    }

    // 2. Generate review using Gemini AI model
    const reviewResult = await generateCodeReview({
      diff,
      prTitle,
      prBody,
      prAuthor,
      repoFullName
    });

    // 3. Attach standard agent branding footer
    const finalComment = `## 🤖 AI Code Review Agent Report\n\n${reviewResult.reviewMarkdown}\n\n---\n*⚡ Reviewed automatically by [AI GitHub Code Review Agent](https://github.com/${repoFullName}) powered by Google Gemini.*`;

    // 4. Post comment to the PR
    await postPullRequestComment(repoFullName, prNumber, finalComment);

    console.log(`✅ [Agent Success] Posted review comment to PR #${prNumber} in ${repoFullName}!`);

    return NextResponse.json({
      status: 'success',
      message: `Code review posted successfully to PR #${prNumber}`,
      prNumber,
      repoFullName
    });
  } catch (error) {
    console.error('❌ [Webhook Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'AI GitHub Code Review Agent Webhook',
    timestamp: new Date().toISOString()
  });
}
