import { NextResponse } from 'next/server';
import { checkGitHubTokenStatus } from '@/lib/github';

export async function GET() {
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;
  const hasGitHubToken = !!process.env.GITHUB_PAT;
  const defaultRepo = process.env.GITHUB_REPO || 'Not configured';

  let githubStatus = { valid: false };
  if (hasGitHubToken) {
    githubStatus = await checkGitHubTokenStatus();
  }

  let geminiStatus = { valid: false };
  if (hasGeminiKey) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash?key=${process.env.GEMINI_API_KEY}`);
      if (res.ok) {
        geminiStatus = { valid: true };
      } else {
        const err = await res.json();
        geminiStatus = { valid: false, error: err.error?.message };
      }
    } catch (e) {
      geminiStatus = { valid: false, error: e.message };
    }
  }

  return NextResponse.json({
    status: (githubStatus.valid && geminiStatus.valid) ? 'ready' : 'configuration_required',
    services: {
      github: {
        configured: hasGitHubToken,
        ...githubStatus,
        repo: defaultRepo
      },
      gemini: {
        configured: hasGeminiKey,
        ...geminiStatus,
        model: 'gemini-2.5-flash'
      }
    },
    timestamp: new Date().toISOString()
  });
}
