'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  ShieldCheck, 
  Bug, 
  Sparkles, 
  Terminal, 
  ExternalLink, 
  Copy, 
  Check, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Github, 
  Code2, 
  Cpu, 
  Zap, 
  Layers
} from 'lucide-react';

const SAMPLE_VULNERABLE_AUTH = `// Sample Diff: Auth Controller with Security Holes
+++ b/controllers/auth.js
@@ -10,15 +10,28 @@
 const express = require('express');
+const sqlite3 = require('sqlite3').verbose();
+const jwt = require('jsonwebtoken');
+const router = express.Router();
+
+// ❌ Hardcoded Secret
+const JWT_SECRET = "supersecret12345_do_not_share";
+
+// ❌ SQL Injection via string interpolation
+router.post('/login', (req, res) => {
+  const { username, password } = req.body;
+  const query = \`SELECT * FROM users WHERE user = '\${username}' AND pass = '\${password}'\`;
+  
+  db.get(query, (err, user) => {
+    if (!user) return res.status(401).json({ error: "Unauthorized" });
+    const token = jwt.sign({ id: user.id }, JWT_SECRET);
+    res.json({ token });
+  });
+});`;

const SAMPLE_PAYMENT_BUG = `// Sample Diff: Payment Processor with Float & Async Bugs
+++ b/services/payment.js
@@ -1,18 +1,25 @@
 const express = require('express');
 const router = express.Router();
+const STRIPE_SECRET = "sk_test_51MzFakeKeyNeverPutSecretInCode998811";
+
+// ❌ Float precision bug in financial calculation
+function calculateDiscount(price, rate) {
+  return price - (price * rate); // 0.1 + 0.2 precision flaw
+}
+
+// ❌ Missing error handling & negative charge flaw
+router.post('/charge', async (req, res) => {
+  const { amount, customerId } = req.body;
+  
+  // Missing negative amount check
+  const charge = await stripe.charges.create({
+    amount: amount,
+    customer: customerId,
+    secretKey: STRIPE_SECRET
+  });
+  
+  res.json({ success: true, id: charge.id });
+});`;

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('simulator');
  const [codeDiff, setCodeDiff] = useState(SAMPLE_VULNERABLE_AUTH);
  const [prTitle, setPrTitle] = useState('feat: add user authentication & login endpoint');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);
  const [reviewError, setReviewError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [currentOrigin, setCurrentOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentOrigin(window.location.origin);
    }
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthStatus(data);
    } catch (e) {
      setHealthStatus({ status: 'error', error: e.message });
    } finally {
      setLoadingHealth(false);
    }
  };

  const handleRunReview = async () => {
    setIsReviewing(true);
    setReviewError(null);
    setReviewResult(null);
    const startTime = performance.now();

    try {
      const res = await fetch('/api/test-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diff: codeDiff,
          prTitle: prTitle,
          repoFullName: healthStatus?.services?.github?.repo || 'gowthamgsakthivel/ai-github-codereview-agent'
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate review');
      }

      setReviewResult(data.review);
      setExecutionTime(((performance.now() - startTime) / 1000).toFixed(2));
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setIsReviewing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const webhookUrl = `${currentOrigin || 'https://your-domain.vercel.app'}/api/webhook`;

  return (
    <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 20px 60px' }}>
      
      {/* Top Navbar */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
          }}>
            <Bot size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI GitHub Code Review Agent
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Autonomous 24/7 PR Security & Quality Reviewer
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            padding: '6px 12px',
            borderRadius: '20px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
            Gemini 2.5 Flash (Free Tier)
          </div>

          <a 
            href={`https://github.com/${healthStatus?.services?.github?.repo || 'gowthamgsakthivel/ai-github-codereview-agent'}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ fontSize: '13px', textDecoration: 'none' }}
          >
            <Github size={16} />
            GitHub Repo
            <ExternalLink size={12} style={{ color: '#64748b' }} />
          </a>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', fontSize: '12px', fontWeight: '600', color: '#a5b4fc', marginBottom: '14px' }}>
            <Sparkles size={14} /> 100% Free • Agentic Workflow • Vercel Serverless
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', lineHeight: 1.25, marginBottom: '12px' }}>
            Transform GitHub Pull Requests into <span style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Instant AI Audits</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '780px', lineHeight: 1.6 }}>
            Every time a developer creates or updates a Pull Request, this serverless agent fetches the git diff, performs deep multi-pillar analysis (Security, Bug Risks, Architecture), and posts high-signal review comments directly on GitHub.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('simulator')}
          className="btn-secondary"
          style={{
            background: activeTab === 'simulator' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            borderColor: activeTab === 'simulator' ? '#6366f1' : 'transparent',
            color: activeTab === 'simulator' ? '#ffffff' : '#94a3b8',
            fontWeight: activeTab === 'simulator' ? '600' : '400'
          }}
        >
          <Play size={16} color={activeTab === 'simulator' ? '#6366f1' : '#94a3b8'} />
          Live Review Simulator
        </button>

        <button
          onClick={() => setActiveTab('webhook')}
          className="btn-secondary"
          style={{
            background: activeTab === 'webhook' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            borderColor: activeTab === 'webhook' ? '#6366f1' : 'transparent',
            color: activeTab === 'webhook' ? '#ffffff' : '#94a3b8',
            fontWeight: activeTab === 'webhook' ? '600' : '400'
          }}
        >
          <Zap size={16} color={activeTab === 'webhook' ? '#06b6d4' : '#94a3b8'} />
          Webhook & Setup
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className="btn-secondary"
          style={{
            background: activeTab === 'diagnostics' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            borderColor: activeTab === 'diagnostics' ? '#6366f1' : 'transparent',
            color: activeTab === 'diagnostics' ? '#ffffff' : '#94a3b8',
            fontWeight: activeTab === 'diagnostics' ? '600' : '400'
          }}
        >
          <Cpu size={16} color={activeTab === 'diagnostics' ? '#10b981' : '#94a3b8'} />
          Health Diagnostics
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className="btn-secondary"
          style={{
            background: activeTab === 'architecture' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            borderColor: activeTab === 'architecture' ? '#6366f1' : 'transparent',
            color: activeTab === 'architecture' ? '#ffffff' : '#94a3b8',
            fontWeight: activeTab === 'architecture' ? '600' : '400'
          }}
        >
          <Layers size={16} color={activeTab === 'architecture' ? '#f59e0b' : '#94a3b8'} />
          Architecture & Workshop
        </button>
      </div>

      {/* TAB 1: SIMULATOR */}
      {activeTab === 'simulator' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Left Column: Input Diff */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code2 size={18} color="#6366f1" />
                Input Git Diff
              </h3>
              
              {/* Presets */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => {
                    setCodeDiff(SAMPLE_VULNERABLE_AUTH);
                    setPrTitle('feat: add user authentication & login endpoint');
                  }}
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                >
                  Auth Sample
                </button>
                <button
                  onClick={() => {
                    setCodeDiff(SAMPLE_PAYMENT_BUG);
                    setPrTitle('feat(payment): add Stripe payment processing endpoint');
                  }}
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                >
                  Payment Sample
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '500' }}>
                Pull Request Title
              </label>
              <input
                type="text"
                value={prTitle}
                onChange={(e) => setPrTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#070b14',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '13px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '500' }}>
                Code / Git Diff Content
              </label>
              <textarea
                value={codeDiff}
                onChange={(e) => setCodeDiff(e.target.value)}
                rows={16}
                className="font-mono"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#050811',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#38bdf8',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  resize: 'vertical'
                }}
              />
            </div>

            <button
              onClick={handleRunReview}
              disabled={isReviewing || !codeDiff.trim()}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              {isReviewing ? (
                <>
                  <RefreshCw size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  Analyzing Code with Gemini 1.5 Flash...
                </>
              ) : (
                <>
                  <Play size={18} />
                  Run AI Code Review
                </>
              )}
            </button>
          </div>

          {/* Right Column: AI Output */}
          <div className="glass-panel" style={{ padding: '24px', minHeight: '520px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot size={18} color="#06b6d4" />
                AI Agent Review Output
              </h3>

              {reviewResult && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {executionTime && (
                    <span style={{ fontSize: '11px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '3px 8px', borderRadius: '6px' }}>
                      ⚡ {executionTime}s
                    </span>
                  )}
                  <button
                    onClick={() => copyToClipboard(reviewResult)}
                    className="btn-secondary"
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                  >
                    {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}
            </div>

            {isReviewing && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>Auditing Code Pillars...</h4>
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>Checking Security Vulnerabilities • Bug Risks • Clean Architecture</p>
              </div>
            )}

            {reviewError && (
              <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', fontSize: '13px' }}>
                <div style={{ fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <XCircle size={16} /> Review Error
                </div>
                {reviewError}
              </div>
            )}

            {!isReviewing && !reviewResult && !reviewError && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', color: '#64748b' }}>
                <Bot size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p style={{ fontSize: '14px', marginBottom: '6px' }}>Ready to review code.</p>
                <p style={{ fontSize: '12px', maxWidth: '280px' }}>Click <strong>"Run AI Code Review"</strong> to test the Gemini agent on the sample code.</p>
              </div>
            )}

            {!isReviewing && reviewResult && (
              <div 
                className="markdown-body font-sans"
                style={{ 
                  background: '#040711', 
                  padding: '20px', 
                  borderRadius: '10px', 
                  border: '1px solid var(--border-color)',
                  maxHeight: '600px',
                  overflowY: 'auto',
                  fontSize: '13px'
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {reviewResult}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: WEBHOOK & SETUP */}
      {activeTab === 'webhook' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Left: Webhook URL */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} color="#06b6d4" />
              Your Live Webhook Endpoint
            </h3>

            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '16px' }}>
              This is the URL to paste into your GitHub repository settings. When hosted on Vercel, it runs 24/7 with zero maintenance.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#050811', border: '1px solid var(--border-color)', padding: '10px 14px', borderRadius: '10px', marginBottom: '24px' }}>
              <code style={{ fontSize: '13px', color: '#38bdf8', flex: 1, wordBreak: 'break-all' }}>
                {webhookUrl}
              </code>
              <button
                onClick={() => copyToClipboard(webhookUrl)}
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px', flexShrink: 0 }}
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#a5b4fc', marginBottom: '8px' }}>
                💡 1-Click Vercel Deployment
              </h4>
              <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '12px' }}>
                Deploy this Next.js project to Vercel for free to get a permanent public HTTPS domain like <code>https://ai-code-reviewer.vercel.app</code>.
              </p>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                Add your <code>GITHUB_PAT</code> and <code>GEMINI_API_KEY</code> in Vercel Project Settings → Environment Variables.
              </div>
            </div>
          </div>

          {/* Right: GitHub Webhook Steps */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Github size={20} color="#ffffff" />
              GitHub 3-Step Setup
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                  1
                </span>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Go to Repo Webhook Settings</h4>
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                    Open your repository → <strong>Settings</strong> → <strong>Webhooks</strong> → click <strong>Add webhook</strong>.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                  2
                </span>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Configure Payload Details</h4>
                  <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                    - <strong>Payload URL</strong>: Paste your Webhook URL.<br/>
                    - <strong>Content type</strong>: Select <code>application/json</code>.<br/>
                    - <strong>Secret</strong>: Leave empty.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                  3
                </span>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Select Pull Request Events</h4>
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                    Choose <em>"Let me select individual events"</em> → Check ✅ <strong>Pull requests</strong> → Click <strong>Add webhook</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DIAGNOSTICS */}
      {activeTab === 'diagnostics' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>System Health & API Connection Status</h3>
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>Verifies credentials and connection to Google Gemini & GitHub APIs.</p>
            </div>
            <button
              onClick={fetchHealth}
              disabled={loadingHealth}
              className="btn-secondary"
              style={{ fontSize: '12px' }}
            >
              <RefreshCw size={14} className={loadingHealth ? 'animate-spin' : ''} style={{ animation: loadingHealth ? 'spin 1s linear infinite' : 'none' }} />
              Re-test Connection
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            {/* Gemini Health Card */}
            <div style={{ background: '#050811', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#06b6d4" />
                  Google Gemini AI
                </span>
                {healthStatus?.services?.gemini?.valid ? (
                  <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> Connected
                  </span>
                ) : (
                  <span style={{ fontSize: '12px', color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <XCircle size={14} /> Check Key
                  </span>
                )}
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
                <div><strong>Model:</strong> <code>gemini-1.5-flash</code></div>
                <div><strong>Tier:</strong> Free (15 Requests/min)</div>
                <div><strong>Status:</strong> {healthStatus?.services?.gemini?.valid ? 'Ready for automated code reviews' : 'Invalid or Missing GEMINI_API_KEY'}</div>
              </div>
            </div>

            {/* GitHub Health Card */}
            <div style={{ background: '#050811', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Github size={16} color="#ffffff" />
                  GitHub API & PAT
                </span>
                {healthStatus?.services?.github?.valid ? (
                  <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> Connected
                  </span>
                ) : (
                  <span style={{ fontSize: '12px', color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <XCircle size={14} /> Invalid Token
                  </span>
                )}
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
                <div><strong>Account:</strong> {healthStatus?.services?.github?.username ? `@${healthStatus.services.github.username}` : 'Not connected'}</div>
                <div><strong>Target Repo:</strong> <code>{healthStatus?.services?.github?.repo || 'Not specified'}</code></div>
                <div><strong>Scope:</strong> Pull Requests Read/Write</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: ARCHITECTURE */}
      {activeTab === 'architecture' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>
            Workshop Architecture & Presentation Blueprint
          </h3>
          <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '24px' }}>
            Use this architecture flow to explain how the Agentic AI workflow works end-to-end during your workshop or hackathon pitch.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            
            <div style={{ background: '#050811', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontWeight: '700', marginBottom: '12px' }}>
                1
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>Event Ingestion</h4>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                GitHub fires a secure webhook event to <code>/api/webhook</code> whenever a PR is created or updated.
              </p>
            </div>

            <div style={{ background: '#050811', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee', fontWeight: '700', marginBottom: '12px' }}>
                2
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>Diff Extraction</h4>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                The serverless agent fetches the exact git diff lines using GitHub REST API and prepares the structured context.
              </p>
            </div>

            <div style={{ background: '#050811', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', fontWeight: '700', marginBottom: '12px' }}>
                3
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>Multi-Pillar AI Analysis</h4>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                Gemini 1.5 Flash audits for Security Vulnerabilities (SQLi, secrets), Edge Case Bugs, and Clean Architecture standards.
              </p>
            </div>

            <div style={{ background: '#050811', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', fontWeight: '700', marginBottom: '12px' }}>
                4
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>Automated PR Feedback</h4>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                The formatted markdown report with verdict, scorecards, and diff code snippets is posted back to GitHub in &lt; 5 seconds.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ marginTop: '48px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
        Built with Google Gemini & Next.js • 100% Free Open Source Workshop Project
      </footer>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
