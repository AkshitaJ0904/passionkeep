const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, passion, bio, avatar, preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = name || user.name;
      user.passion = passion || user.passion;
      user.bio = bio || user.bio;
      user.avatar = avatar || user.avatar;
      if (preferences) {
        user.preferences = { ...user.preferences, ...preferences };
      }

      const updatedUser = await user.save();
      res.json({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        passion: updatedUser.passion,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        preferences: updatedUser.preferences,
        stats: updatedUser.stats
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;