const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// OWASP Top 10 (2021) detection patterns
const OWASP_CHECKS = [
  {
    id: 'A01',
    name: 'Broken Access Control',
    patterns: [
      /\.\.\/|\.\.\\|path\s*traversal/i,
      /admin|\/etc\/passwd|\/etc\/shadow/i,
      /idor|insecure.direct.object/i,
      /unauthorized.*access|access.*control.*bypass/i
    ],
    description: 'Attempt to access resources without proper authorization'
  },
  {
    id: 'A02',
    name: 'Cryptographic Failures',
    patterns: [
      /md5|sha1\b|des\b|rc4/i,
      /password.*plain|plaintext.*pass|base64.*password/i,
      /http:\/\/(?!localhost)/i,
      /no.?ssl|disable.?ssl|verify.*false/i
    ],
    description: 'Weak or missing encryption of sensitive data'
  },
  {
    id: 'A03',
    name: 'Injection',
    patterns: [
      /union\s+select|select\s+\*\s+from|drop\s+table|insert\s+into/i,
      /exec\s*\(|eval\s*\(|system\s*\(/i,
      /<script[\s>]|javascript:|onerror\s*=|onload\s*=/i,
      /\$\{.*\}|\{\{.*\}\}|#\{.*\}/,
      /cmd\.exe|\/bin\/sh|\/bin\/bash|powershell/i
    ],
    description: 'SQL injection, XSS, command injection, or template injection'
  },
  {
    id: 'A04',
    name: 'Insecure Design',
    patterns: [
      /no.?rate.?limit|unlimited.?attempts|brute.?force/i,
      /security.?through.?obscurity/i,
      /hardcoded.?(password|secret|key|token)/i
    ],
    description: 'Missing security controls at the design level'
  },
  {
    id: 'A05',
    name: 'Security Misconfiguration',
    patterns: [
      /debug\s*=\s*true|debug\s*:\s*true/i,
      /default.?password|admin.*admin|root.*root/i,
      /expose.*stack.?trace|display_errors\s*=\s*on/i,
      /allow.*origin.*\*|cors.*\*/i,
      /x-powered-by|server:\s*apache|server:\s*nginx/i
    ],
    description: 'Default configs, exposed debug info, overly permissive settings'
  },
  {
    id: 'A06',
    name: 'Vulnerable Components',
    patterns: [
      /jquery\s+1\.|jquery\s+2\.|log4j|struts2/i,
      /cve-\d{4}-\d+/i,
      /version\s*=\s*["']?(0\.|1\.0|1\.1)/i
    ],
    description: 'Use of known vulnerable libraries or frameworks'
  },
  {
    id: 'A07',
    name: 'Auth & Session Failures',
    patterns: [
      /session.?fixation|session.?hijack/i,
      /jwt.*none|alg.*none/i,
      /remember.?me.*forever|session.*never.*expire/i,
      /weak.*password|no.*password.*policy/i
    ],
    description: 'Broken authentication or session management'
  },
  {
    id: 'A08',
    name: 'Software & Data Integrity Failures',
    patterns: [
      /deserializ|pickle\.loads|yaml\.load\s*\(/i,
      /eval\s*\(.*json|json.*eval/i,
      /untrusted.*deserializ/i
    ],
    description: 'Unsafe deserialization or integrity verification failures'
  },
  {
    id: 'A09',
    name: 'Security Logging Failures',
    patterns: [
      /no.?log|disable.?log|logging.*false/i,
      /catch.*\{\s*\}|swallow.*exception/i,
      /console\.log.*(password|token|secret|key)/i
    ],
    description: 'Missing or inadequate security event logging'
  },
  {
    id: 'A10',
    name: 'Server-Side Request Forgery (SSRF)',
    patterns: [
      /169\.254\.169\.254|metadata\.google|instance-data/i,
      /localhost|127\.0\.0\.1|0\.0\.0\.0|::1/i,
      /fetch\s*\(.*req\.|curl.*\$_(GET|POST|REQUEST)/i,
      /file:\/\/|dict:\/\/|gopher:\/\//i
    ],
    description: 'Forcing server to make requests to internal/unintended locations'
  }
];

router.post('/check', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const findings = [];

    for (const check of OWASP_CHECKS) {
      const matchedPatterns = [];

      for (const pattern of check.patterns) {
        const match = content.match(pattern);
        if (match) {
          matchedPatterns.push(match[0].substring(0, 60));
        }
      }

      if (matchedPatterns.length > 0) {
        findings.push({
          id: check.id,
          name: check.name,
          description: check.description,
          severity: matchedPatterns.length >= 2 ? 'HIGH' : 'MEDIUM',
          matches: [...new Set(matchedPatterns)] // dedupe
        });
      }
    }

    const riskScore = Math.min(100, findings.reduce((acc, f) => acc + (f.severity === 'HIGH' ? 30 : 15), 0));
    const verdict = riskScore >= 60 ? 'DANGEROUS' : riskScore >= 20 ? 'SUSPICIOUS' : 'SAFE';

    res.json({
      findings,
      totalVulnerabilities: findings.length,
      riskScore,
      verdict,
      checkedAgainst: 'OWASP Top 10 (2021)'
    });
  } catch (err) {
    console.error('OWASP check error:', err);
    res.status(500).json({ error: 'OWASP check failed' });
  }
});

// Return full OWASP Top 10 reference list
router.get('/reference', auth, (req, res) => {
  res.json({
    version: '2021',
    categories: OWASP_CHECKS.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description
    }))
  });
});

module.exports = router;
