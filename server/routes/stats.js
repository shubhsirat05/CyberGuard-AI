const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Analysis = require('../models/Analysis');
const Training = require('../models/Training');

const router = express.Router();

router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const recentAnalyses = await Analysis.find({ userId: req.user._id })
      .sort({ createdAt: -1 }).limit(5).select('result.verdict contentType createdAt');

    const recentTraining = await Training.find({
      userId: req.user._id,
      'userAnswer.submittedAt': { $exists: true }
    }).sort({ createdAt: -1 }).limit(5).select('result.correct result.score scenario.type createdAt');

    const threatBreakdown = await Analysis.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$result.verdict', count: { $sum: 1 } } }
    ]);

    const accuracy = user.stats.scenariosCompleted > 0
      ? Math.round((user.stats.correctIdentifications / user.stats.scenariosCompleted) * 100)
      : 0;

    const avgScore = user.stats.scenariosCompleted > 0
      ? Math.round(user.stats.trainingScore / user.stats.scenariosCompleted)
      : 0;

    res.json({
      stats: {
        ...user.stats.toObject(),
        accuracy,
        avgScore
      },
      recentAnalyses,
      recentTraining,
      threatBreakdown
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
