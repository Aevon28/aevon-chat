const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Query must be at least 2 characters' });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
      _id: { $ne: req.user.id },
    }).select('username avatar email bio isOnline lastSeen');

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      'username avatar email bio phone isOnline lastSeen friends'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put(
  '/profile',
  auth,
  [
    body('username').optional().isLength({ min: 3 }),
    body('bio').optional().isLength({ max: 160 }),
    body('phone').optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, bio, phone, avatar } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (username) user.username = username;
      if (bio) user.bio = bio;
      if (phone) user.phone = phone;
      if (avatar) user.avatar = avatar;

      await user.save();

      res.json({
        message: 'Profile updated successfully',
        user: user.getPublicProfile(),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.put('/settings', auth, async (req, res) => {
  try {
    const { theme, notificationsEnabled, soundNotifications, emailNotifications, privacy } =
      req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (theme) user.settings.theme = theme;
    if (notificationsEnabled !== undefined) user.settings.notificationsEnabled = notificationsEnabled;
    if (soundNotifications !== undefined) user.settings.soundNotifications = soundNotifications;
    if (emailNotifications !== undefined) user.settings.emailNotifications = emailNotifications;
    if (privacy) user.settings.privacy = privacy;

    await user.save();

    res.json({
      message: 'Settings updated successfully',
      settings: user.settings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/block/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const blockedUser = await User.findById(req.params.id);

    if (!user || !blockedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.blockedUsers.includes(req.params.id)) {
      user.blockedUsers.push(req.params.id);
      await user.save();
    }

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/unblock/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.blockedUsers = user.blockedUsers.filter((id) => id.toString() !== req.params.id);
    await user.save();

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/blocked', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      'blockedUsers',
      'username avatar email'
    );

    res.json(user.blockedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;