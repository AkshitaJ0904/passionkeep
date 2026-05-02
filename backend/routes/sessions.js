const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Create session
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, duration, joyLevel, stressLevel, energyLevel, reflection, tags, mood } = req.body;
    const session = await Session.create({
      user: req.user._id,
      passion: req.user.passion,
      title, description, duration, joyLevel, stressLevel, energyLevel, reflection, tags, mood
    });

    // Determine burnout risk
    let burnoutRisk = 'low';
    if (stressLevel >= 7 || joyLevel <= 3) burnoutRisk = 'high';
    else if (stressLevel >= 5 || joyLevel <= 5) burnoutRisk = 'medium';
    session.burnoutRisk = burnoutRisk;
    await session.save();

    // Update user stats
    const allSessions = await Session.find({ user: req.user._id });
    const avgJoy = allSessions.reduce((a, s) => a + s.joyLevel, 0) / allSessions.length;
    const avgStress = allSessions.reduce((a, s) => a + s.stressLevel, 0) / allSessions.length;

    await User.findByIdAndUpdate(req.user._id, {
      'stats.totalSessions': allSessions.length,
      'stats.avgJoy': Math.round(avgJoy * 10) / 10,
      'stats.avgStress': Math.round(avgStress * 10) / 10,
      'stats.lastSession': new Date()
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all sessions for user
router.get('/', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get session stats
router.get('/stats', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id }).sort({ createdAt: 1 });
    const last30 = sessions.filter(s => new Date(s.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

    const trendData = last30.map(s => ({
      date: s.createdAt,
      joy: s.joyLevel,
      stress: s.stressLevel,
      energy: s.energyLevel,
      duration: s.duration
    }));

    const burnoutCount = { low: 0, medium: 0, high: 0 };
    sessions.forEach(s => burnoutCount[s.burnoutRisk]++);

    res.json({
      total: sessions.length,
      trendData,
      burnoutDistribution: burnoutCount,
      recentSessions: sessions.slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete session
router.delete('/:id', protect, async (req, res) => {
  try {
    await Session.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
