const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { postToInstagram, postToTikTok } = require('../services/socialMedia');
const Account = require('../models/Account');
const logger = require('../utils/logger');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    
    // Create uploads directory if not exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos only
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed!'));
    }
  }
});

// ============================================
// POST /api/posts/create
// Create and post content to social media
// ============================================
router.post('/create', upload.single('media'), async (req, res) => {
  try {
    const { caption, accountIds } = req.body;
    
    // Validate input
    if (!caption) {
      return res.status(400).json({
        success: false,
        error: 'Caption is required'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Media file is required'
      });
    }
    
    if (!accountIds) {
      return res.status(400).json({
        success: false,
        error: 'At least one account must be selected'
      });
    }
    
    const mediaPath = req.file.path;
    const accounts = JSON.parse(accountIds);
    
    logger.info(`Starting post creation for ${accounts.length} accounts`);
    logger.info(`Caption: ${caption.substring(0, 50)}...`);
    logger.info(`Media: ${req.file.filename}`);
    
    const results = [];
    
    // Process each account
    for (const accountId of accounts) {
      try {
        const account = await Account.findById(accountId);
        
        if (!account) {
          logger.error(`Account not found: ${accountId}`);
          results.push({
            accountId,
            platform: 'unknown',
            success: false,
            message: 'Account not found'
          });
          continue;
        }
        
        logger.info(`Processing account: ${account.name}`);
        
        // Post to Instagram if enabled
        if (account.instagram && account.instagram.enabled) {
          logger.info(`Posting to Instagram for ${account.name}`);
          
          try {
            const igResult = await postToInstagram(accountId, mediaPath, caption);
            results.push({
              accountId,
              accountName: account.name,
              platform: 'Instagram',
              username: account.instagram.username,
              ...igResult
            });
            
            logger.info(`Instagram result for ${account.name}: ${igResult.success ? 'SUCCESS' : 'FAILED'}`);
          } catch (error) {
            logger.error(`Instagram error for ${account.name}: ${error.message}`);
            results.push({
              accountId,
              accountName: account.name,
              platform: 'Instagram',
              username: account.instagram.username,
              success: false,
              message: error.message
            });
          }
        }
        
        // Post to TikTok if enabled
        if (account.tiktok && account.tiktok.enabled) {
          logger.info(`Posting to TikTok for ${account.name}`);
          
          try {
            const ttResult = await postToTikTok(accountId, mediaPath, caption);
            results.push({
              accountId,
              accountName: account.name,
              platform: 'TikTok',
              username: account.tiktok.username,
              ...ttResult
            });
            
            logger.info(`TikTok result for ${account.name}: ${ttResult.success ? 'SUCCESS' : 'FAILED'}`);
          } catch (error) {
            logger.error(`TikTok error for ${account.name}: ${error.message}`);
            results.push({
              accountId,
              accountName: account.name,
              platform: 'TikTok',
              username: account.tiktok.username,
              success: false,
              message: error.message
            });
          }
        }
        
      } catch (error) {
        logger.error(`Error processing account ${accountId}: ${error.message}`);
        results.push({
          accountId,
          success: false,
          message: error.message
        });
      }
    }
    
    // Clean up uploaded file after processing
    // Uncomment if you want to delete file after posting
    // fs.unlinkSync(mediaPath);
    
    logger.success('Post creation completed');
    
    res.json({
      success: true,
      message: 'Posting completed',
      results: results,
      file: req.file.filename
    });
    
  } catch (error) {
    logger.error(`Post creation error: ${error.message}`);
    
    // Clean up file if error occurs
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        logger.error(`Failed to delete file: ${unlinkError.message}`);
      }
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// GET /api/posts/history
// Get posting history
// ============================================
router.get('/history', async (req, res) => {
  try {
    // This is a placeholder
    // You would need to create a Post model to store history
    res.json({
      success: true,
      history: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// POST /api/posts/schedule
// Schedule a post for later
// ============================================
router.post('/schedule', upload.single('media'), async (req, res) => {
  try {
    const { caption, accountIds, scheduleTime } = req.body;
    
    // Validate input
    if (!caption || !req.file || !accountIds || !scheduleTime) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }
    
    logger.info(`Scheduling post for ${scheduleTime}`);
    
    // Here you would implement scheduling logic
    // Using node-cron or similar
    
    res.json({
      success: true,
      message: 'Post scheduled successfully',
      scheduleTime: scheduleTime
    });
    
  } catch (error) {
    logger.error(`Schedule error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// GET /api/posts/scheduled
// Get all scheduled posts
// ============================================
router.get('/scheduled', async (req, res) => {
  try {
    // Placeholder for scheduled posts
    res.json({
      success: true,
      scheduled: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// DELETE /api/posts/scheduled/:id
// Cancel a scheduled post
// ============================================
router.delete('/scheduled/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info(`Cancelling scheduled post: ${id}`);
    
    res.json({
      success: true,
      message: 'Scheduled post cancelled'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;