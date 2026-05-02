const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const Session = require('../models/Session');
const { protect } = require('../middleware/auth');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const PASSION_CONTEXTS = {
  photography: 'a passionate photographer who captures moments through the lens',
  art: 'a creative artist who expresses emotions through visual art',
  dancing: 'a dancer who communicates stories through movement',
  writing: 'a writer who crafts worlds and emotions through words',
  music: 'a musician who creates feelings through sound'
};

// Generate AI insight for a session
router.post('/insight', protect, async (req, res) => {
  try {
    const { joyLevel, stressLevel, energyLevel, reflection, duration, title } = req.body;
    const passionContext = PASSION_CONTEXTS[req.user.passion] || 'a passionate hobbyist';

    // Get user's recent sessions for context
    const recentSessions = await Session.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5);
    const trendSummary = recentSessions.length > 0
      ? `Recent average joy: ${(recentSessions.reduce((a,s)=>a+s.joyLevel,0)/recentSessions.length).toFixed(1)}/10, stress: ${(recentSessions.reduce((a,s)=>a+s.stressLevel,0)/recentSessions.length).toFixed(1)}/10`
      : 'This is their first session';

    const prompt = `You are PassionKeep's empathetic AI companion. You're speaking with ${req.user.name}, ${passionContext}.

Session details:
- Activity: "${title}"
- Duration: ${duration} minutes
- Joy level: ${joyLevel}/10
- Stress level: ${stressLevel}/10  
- Energy level: ${energyLevel}/10
- Their reflection: "${reflection || 'No reflection added'}"
- ${trendSummary}

Write a warm, personalized insight (2-3 sentences) that:
1. Acknowledges their specific session meaningfully
2. Gives one actionable tip to preserve joy or reduce burnout
3. Ends with genuine encouragement

Keep it conversational, NOT generic. Reference their specific passion (${req.user.passion}). Be like a supportive mentor who truly cares.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.8
    });

    res.json({ insight: completion.choices[0].message.content });
  } catch (err) {
    console.error('Groq error:', err);
    res.status(500).json({ message: 'AI service unavailable', insight: 'Keep nurturing your passion with joy!' });
  }
});

// Generate weekly report
router.get('/weekly-report', protect, async (req, res) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const sessions = await Session.find({ user: req.user._id, createdAt: { $gte: weekAgo } });

    if (sessions.length === 0) {
      return res.json({ report: "You haven't logged any sessions this week. Even small moments with your passion count — try logging a 15-minute session today!" });
    }

    const avgJoy = (sessions.reduce((a,s)=>a+s.joyLevel,0)/sessions.length).toFixed(1);
    const avgStress = (sessions.reduce((a,s)=>a+s.stressLevel,0)/sessions.length).toFixed(1);
    const totalMinutes = sessions.reduce((a,s)=>a+s.duration,0);
    const passionContext = PASSION_CONTEXTS[req.user.passion];

    const prompt = `You are PassionKeep's insightful weekly analyst. Generate a heartfelt weekly report for ${req.user.name}, ${passionContext}.

This week's data:
- Sessions logged: ${sessions.length}
- Total time invested: ${totalMinutes} minutes
- Average joy: ${avgJoy}/10
- Average stress: ${avgStress}/10
- Activities: ${sessions.map(s=>s.title).join(', ')}

Write a 3-paragraph weekly reflection that:
1. Celebrates their wins from this week specifically
2. Identifies one pattern (positive or concerning) in their journey
3. Sets an inspiring intention for next week

Make it feel like a personal letter from someone who deeply understands the ${req.user.passion} journey. Be poetic but practical.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.85
    });

    res.json({ report: completion.choices[0].message.content, stats: { sessions: sessions.length, avgJoy, avgStress, totalMinutes } });
  } catch (err) {
    res.status(500).json({ message: 'AI service unavailable' });
  }
});

// Burnout check
router.post('/burnout-check', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);
    if (sessions.length < 3) return res.json({ risk: 'low', message: 'Keep logging to get accurate insights!' });

    const recent = sessions.slice(0, 5);
    const avgRecentJoy = recent.reduce((a,s)=>a+s.joyLevel,0)/recent.length;
    const avgRecentStress = recent.reduce((a,s)=>a+s.stressLevel,0)/recent.length;

    let risk = 'low';
    if (avgRecentJoy < 4 || avgRecentStress > 7) risk = 'high';
    else if (avgRecentJoy < 6 || avgRecentStress > 5) risk = 'medium';

    const prompt = `PassionKeep AI: ${req.user.name} is ${passionContext || 'a passionate person'} (${req.user.passion}). 
Burnout risk: ${risk}. Recent avg joy: ${avgRecentJoy.toFixed(1)}/10, stress: ${avgRecentStress.toFixed(1)}/10.
Give 2-3 specific, actionable recovery strategies tailored to their passion. Be warm and empowering.`;

    const passionContext = PASSION_CONTEXTS[req.user.passion];
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 250,
      temperature: 0.75
    });

    res.json({ risk, message: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ message: 'AI service unavailable' });
  }
});

module.exports = router;
