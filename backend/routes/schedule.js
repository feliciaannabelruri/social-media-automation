const express = require('express');
const router = express.Router();
const scheduler = require('../services/scheduler');
const { postLimiter } = require('../middleware/rateLimiter');

// Schedule a post
router.post('/', postLimiter, async (req, res) => {
  try {
    const { postData, scheduleTime } = req.body;
    const postId = scheduler.schedulePost(postData, scheduleTime);
    
    res.json({
      success: true,
      message: 'Post scheduled successfully',
      postId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all scheduled posts
router.get('/', async (req, res) => {
  try {
    const scheduled = scheduler.getAllScheduled();
    res.json(scheduled);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel scheduled post
router.delete('/:postId', async (req, res) => {
  try {
    scheduler.cancelSchedule(req.params.postId);
    res.json({ success: true, message: 'Schedule canceled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;