const express = require('express');
const authMiddleware = require('../middleware/auth');
const profileController = require('../controllers/profileController');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get user profile
router.get('/', async (req, res) => {
  try {
    const profile = await profileController.getProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/', async (req, res) => {
  try {
    const profile = await profileController.updateProfile(req.user.id, req.body);
    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await profileController.getUserStats(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;