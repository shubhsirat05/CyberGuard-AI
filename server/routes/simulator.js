const express = require('express');
const Groq = require('groq-sdk');
const auth = require('../middleware/auth');
const Training = require('../models/Training');
const User = require('../models/User');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SCENARIO_PROMPT = `You are CyberGuard AI training simulator. Generate realistic cybersecurity training scenarios.

Create ONE scenario of the requested type. Mix real-looking legitimate messages with fake threat scenarios.
About 40% should be legitimate (isReal: true), 60% should be threats (isReal: false).

Respond ONLY with valid JSON:
{
  "type": "email" | "sms" | "social",
  "content": "the full realistic message content",
  "isReal": true | false,
  "attackType": "Phishing" | "Smishing" | "Vishing" | "Spear Phishing" | "Business Email Compromise" | "Social Engineering" | "Legitimate" | "Pretexting",
  "difficulty": "easy" | "medium" | "hard",
  "senderInfo": "fake sender name/number/profile",
  "subject": "subject line if email, otherwise null"
}

Make it realistic - use plausible company names, proper formatting, real-looking urgency tactics for threats.
For legitimate messages, make them look completely normal and trustworthy.`;

const EVALUATION_PROMPT = `You are CyberGuard AI evaluating a user's threat identification answer.

Given the scenario and the user's answer, provide detailed feedback.

Respond ONLY with valid JSON:
{
  "correct": true | false,
  "score": number 0-100,
  "explanation": "detailed 2-3 sentence explanation of why this is or isn't a threat",
  "redFlags": ["specific", "indicators", "in", "the", "content"],
  "learningPoint": "one key takeaway lesson"
}`;

// Generate new scenario
router.post('/scenario', auth, async (req, res) => {
  try {
    const { type = 'email', difficulty = 'medium' } = req.body;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SCENARIO_PROMPT },
        { role: 'user', content: `Generate a ${difficulty} difficulty ${type} scenario for cybersecurity training.` }
      ],
      temperature: 0.9,
      max_tokens: 600
    });

    const responseText = completion.choices[0]?.message?.content || '';
    let scenario;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      scenario = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      return res.status(500).json({ error: 'Failed to generate scenario' });
    }

    // Save to DB (without revealing the answer)
    const training = await Training.create({
      userId: req.user._id,
      scenario: {
        type: scenario.type,
        content: scenario.content,
        isReal: scenario.isReal,
        attackType: scenario.attackType,
        difficulty: scenario.difficulty
      }
    });

    // Return scenario without the answer
    res.json({
      id: training._id,
      type: scenario.type,
      content: scenario.content,
      senderInfo: scenario.senderInfo,
      subject: scenario.subject,
      difficulty: scenario.difficulty
    });
  } catch (err) {
    console.error('Simulator error:', err);
    res.status(500).json({ error: 'Failed to generate scenario. Check your Groq API key.' });
  }
});

// Submit answer
router.post('/answer/:id', auth, async (req, res) => {
  try {
    const { isReal, attackType } = req.body;
    const training = await Training.findOne({ _id: req.params.id, userId: req.user._id });
    if (!training) return res.status(404).json({ error: 'Training session not found' });
    if (training.userAnswer?.submittedAt) return res.status(400).json({ error: 'Already answered' });

    // AI evaluation
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: EVALUATION_PROMPT },
        {
          role: 'user',
          content: `Scenario content: "${training.scenario.content}"
Correct answer: isReal=${training.scenario.isReal}, attackType="${training.scenario.attackType}"
User answered: isReal=${isReal}, attackType="${attackType || 'not specified'}"
Evaluate this response.`
        }
      ],
      temperature: 0.3,
      max_tokens: 400
    });

    const responseText = completion.choices[0]?.message?.content || '';
    let evaluation;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      evaluation = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      evaluation = {
        correct: isReal === training.scenario.isReal,
        score: isReal === training.scenario.isReal ? 70 : 0,
        explanation: 'Could not generate detailed feedback.',
        redFlags: [],
        learningPoint: 'Keep practicing to improve your threat detection skills.'
      };
    }

    // Update training record
    training.userAnswer = { isReal, attackType, submittedAt: new Date() };
    training.result = {
      correct: evaluation.correct,
      score: evaluation.score,
      explanation: evaluation.explanation,
      redFlags: evaluation.redFlags || []
    };
    await training.save();

    // Update user stats
    const updateData = {
      $inc: {
        'stats.scenariosCompleted': 1,
        'stats.trainingScore': evaluation.score,
        'stats.correctIdentifications': evaluation.correct ? 1 : 0
      }
    };
    await User.findByIdAndUpdate(req.user._id, updateData);

    res.json({
      correct: evaluation.correct,
      score: evaluation.score,
      explanation: evaluation.explanation,
      redFlags: evaluation.redFlags || [],
      learningPoint: evaluation.learningPoint,
      correctAnswer: {
        isReal: training.scenario.isReal,
        attackType: training.scenario.attackType
      }
    });
  } catch (err) {
    console.error('Answer error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get training history
router.get('/history', auth, async (req, res) => {
  try {
    const sessions = await Training.find({
      userId: req.user._id,
      'userAnswer.submittedAt': { $exists: true }
    }).sort({ createdAt: -1 }).limit(20);
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
