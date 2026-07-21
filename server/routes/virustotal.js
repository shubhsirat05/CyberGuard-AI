const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();
const VT_API = 'https://www.virustotal.com/api/v3';

router.post('/scan-url', auth, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const apiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'VirusTotal API key not configured', vtAvailable: false });

    // First try fetching existing report by URL id
    const urlId = Buffer.from(url).toString('base64url');
    const existingRes = await fetch(`${VT_API}/urls/${urlId}`, {
      headers: { 'x-apikey': apiKey }
    });

    if (existingRes.ok) {
      const existingData = await existingRes.json();
      const attrs = existingData.data?.attributes;
      if (attrs?.last_analysis_stats) {
        const stats = attrs.last_analysis_stats;
        const results = attrs.last_analysis_results || {};
        return res.json(buildResponse(url, stats, results));
      }
    }

    // Submit URL for scanning
    const submitRes = await fetch(`${VT_API}/urls`, {
      method: 'POST',
      headers: {
        'x-apikey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `url=${encodeURIComponent(url)}`
    });

    if (!submitRes.ok) {
      const err = await submitRes.json();
      return res.status(400).json({ error: err.error?.message || 'Submission failed' });
    }

    const submitData = await submitRes.json();
    const analysisId = submitData.data?.id;

    // Poll up to 8 times, 3s apart = 24s max
    let analysis = null;
    for (let i = 0; i < 8; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const pollRes = await fetch(`${VT_API}/analyses/${analysisId}`, {
        headers: { 'x-apikey': apiKey }
      });
      const pollData = await pollRes.json();
      if (pollData.data?.attributes?.status === 'completed') {
        analysis = pollData.data.attributes;
        break;
      }
    }

    if (!analysis) {
      return res.json({
        vtAvailable: true,
        status: 'pending',
        message: 'Scan is still processing. Try scanning again in 30 seconds.'
      });
    }

    return res.json(buildResponse(url, analysis.stats, analysis.results || {}));

  } catch (err) {
    console.error('VT error:', err);
    res.status(500).json({ error: 'VirusTotal scan failed', vtAvailable: false });
  }
});

function buildResponse(url, stats, results) {
  const malicious = stats.malicious || 0;
  const suspicious = stats.suspicious || 0;
  const harmless = stats.harmless || 0;
  const undetected = stats.undetected || 0;
  const total = malicious + suspicious + harmless + undetected;

  const flaggedBy = Object.entries(results)
    .filter(([, v]) => v.category === 'malicious' || v.category === 'suspicious')
    .map(([engine, v]) => ({ engine, category: v.category, result: v.result }))
    .slice(0, 10);

  const verdict = malicious >= 3 ? 'DANGEROUS' : malicious >= 1 || suspicious >= 3 ? 'SUSPICIOUS' : 'SAFE';

  return {
    vtAvailable: true,
    url,
    verdict,
    stats: { malicious, suspicious, harmless, undetected, total },
    flaggedBy,
    scanDate: new Date().toISOString()
  };
}

module.exports = router;