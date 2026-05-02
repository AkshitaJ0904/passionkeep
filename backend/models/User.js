const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  passion: {
    type: String,
    enum: ['photography', 'art', 'dancing', 'writing', 'music'],
    required: true
  },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  preferences: {
    notifications: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: true },
    burnoutAlerts: { type: Boolean, default: true }
  },
  stats: {
    totalSessions: { type: Number, default: 0 },
    avgJoy: { type: Number, default: 0 },
    avgStress: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastSession: { type: Date }
  },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);