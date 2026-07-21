const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scenario: {
    type: { type: String, enum: ['email', 'sms', 'social'], required: true },
    content: String,
    isReal: Boolean,
    attackType: String,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
  },
  userAnswer: {
    isReal: Boolean,
    attackType: String,
    submittedAt: Date
  },
  result: {
    correct: Boolean,
    score: Number,
    explanation: String,
    redFlags: [String]
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Training', trainingSchema);
