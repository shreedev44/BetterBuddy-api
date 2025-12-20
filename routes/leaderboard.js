const express = require('express');
const Leaderboard = require('../models/Leaderboard');

const router = express.Router();

// Get leaderboard (public endpoint, no auth required)
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const leaderboard = await Leaderboard.find()
      .sort({ score: -1 })
      .limit(limit)
      .select('name email score lastUpdated')
      .lean();

    res.json({
      leaderboard: leaderboard.map((entry, index) => ({
        rank: index + 1,
        name: entry.name || entry.email,
        email: entry.email,
        score: entry.score,
        lastUpdated: entry.lastUpdated,
      })),
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

