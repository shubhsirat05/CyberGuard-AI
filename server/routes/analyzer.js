const express = require('express');
const Groq = require('groq-sdk');
const auth = require('../middleware/auth');
const Analysis = require('../models/Analysis');
const User = require('../models/User');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const ANALYZER_PROMPT = `You are CyberGuard AI, an expert cybersecurity threat analyzer. 
Analyze the provided content (email, URL, code snippet, or message) for security threats.

Respond ONLY with valid JSON in this exact format:
{
  "verdict": "SAFE" | "SUSPICIOUS" | "DANGEROUS",
  "contentType": "email" | "url" | "code" | "message" | "unknown",
  "attackType": "string describing attack type or 'None detected'",
  "riskScore": number between 0-100,
  "explanation": "clear explanation of findings in 2-3 sentences",
  "dataAtRisk": ["array", "of", "data types at risk"],
  "protectionTips": ["array", "of", "actionable tips"],
  "indicators": ["array", "of", "specific red flags found"]
}

Be thorough but concise. Focus on real security indicators.`;

router.post('/analyze', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: ANALYZER_PROMPT },
        { role: 'user', content: `Analyze this content:\n\n${content}` }
      ],
      temperature: 0.2,
      max_tokens: 800
    });

    const responseText = completion.choices[0]?.message?.content || '';
    let result;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    // Save analysis
    const analysis = await Analysis.create({
      userId: req.user._id,
      content: content.substring(0, 2000),
      contentType: result.contentType || 'unknown',
      result: {
        verdict: result.verdict,
        attackType: result.attackType,
        riskScore: result.riskScore,
        explanation: result.explanation,
        dataAtRisk: result.dataAtRisk || [],
        protectionTips: result.protectionTips || [],
        indicators: result.indicators || []
      }
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.totalAnalyses': 1 } });

    res.json({ analysis: analysis.result, id: analysis._id });
  } catch (err) {
    console.error('Analyzer error:', err);
    res.status(500).json({ error: 'Analysis failed. Check your Groq API key.' });
  }
});

// Get analysis history
router.get('/history', auth, async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-__v');
    res.json({ analyses });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
