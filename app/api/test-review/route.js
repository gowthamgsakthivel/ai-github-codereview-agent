import { NextResponse } from 'next/server';
import { generateCodeReview } from '@/lib/reviewer';
import { fetchPullRequestDiff } from '@/lib/github';

export async function POST(request) {
  try {
    const body = await request.json();
    const { diff, prNumber, repoFullName, prTitle, prBody } = body;

    let targetDiff = diff;

    // If PR number is passed, fetch from GitHub directly
    if (prNumber && repoFullName) {
      targetDiff = await fetchPullRequestDiff(repoFullName, prNumber);
    }

    if (!targetDiff || targetDiff.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide either code diff text or a valid PR number.' },
        { status: 400 }
      );
    }

    const review = await generateCodeReview({
      diff: targetDiff,
      prTitle: prTitle || `PR Review #${prNumber || 'Simulator'}`,
      prBody: prBody || 'Simulated test review triggered from dashboard',
      prAuthor: 'workshop-attendee',
      repoFullName: repoFullName || 'demo-org/sample-repo'
    });

    return NextResponse.json({
      status: 'success',
      review: review.reviewMarkdown,
      isTruncated: review.isTruncated,
      diffLength: targetDiff.length
    });
  } catch (error) {
    console.error('Test review error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate review.' },
      { status: 500 }
    );
  }
}
