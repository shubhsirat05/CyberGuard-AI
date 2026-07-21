const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  contentType: { type: String, enum: ['email', 'url', 'code', 'message', 'unknown'], default: 'unknown' },
  result: {
    verdict: { type: String, enum: ['SAFE', 'SUSPICIOUS', 'DANGEROUS'], required: true },
    attackType: String,
    riskScore: { type: Number, min: 0, max: 100 },
    explanation: String,
    dataAtRisk: [String],
    protectionTips: [String],
    indicators: [String]
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analysis', analysisSchema);
