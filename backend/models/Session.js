const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  passion: {
    type: String,
    enum: ['photography', 'art', 'dancing', 'writing', 'music'],
    required: true
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  duration: { type: Number, required: true, min: 1 }, // minutes
  joyLevel: { type: Number, required: true, min: 1, max: 10 },
  stressLevel: { type: Number, required: true, min: 1, max: 10 },
  energyLevel: { type: Number, required: true, min: 1, max: 10 },
  reflection: { type: String, default: '' },
  tags: [{ type: String }],
  mood: {
    type: String,
    enum: ['amazing', 'good', 'neutral', 'tired', 'frustrated'],
    default: 'good'
  },
  aiInsight: { type: String, default: '' },
  burnoutRisk: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', sessionSchema);
