const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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
    logger.info('Post create request received');
    
    const { caption, accountIds } = req.body;
    
    // Validation
    if (!caption) {
      logger.warning('Caption is missing');
      return res.status(400).json({
        success: false,
        error: 'Caption is required'
      });
    }
    
    if (!req.file) {
      logger.warning('Media file is missing');
      return res.status(400).json({
        success: false,
        error: 'Media file is required'
      });
    }
    
    if (!accountIds) {
      logger.warning('No accounts selected');
      return res.status(400).json({
        success: false,
        error: 'At least one account must be selected'
      });
    }
    
    const mediaPath = req.file.path;
    const accounts = JSON.parse(accountIds);
    
    logger.info(`Processing post for ${accounts.length} accounts`);
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
          logger.info(`Instagram posting for ${account.name} - SIMULATED`);
          
          // SIMULATED - Real implementation would use Instagram API
          results.push({
            accountId,
            accountName: account.name,
            platform: 'Instagram',
            username: account.instagram.username,
            success: true,
            message: 'Posted successfully (simulated)'
          });
        }
        
        // Post to TikTok if enabled
        if (account.tiktok && account.tiktok.enabled) {
          logger.info(`TikTok posting for ${account.name} - SIMULATED`);
          
          // SIMULATED - Real implementation would use TikTok API
          results.push({
            accountId,
            accountName: account.name,
            platform: 'TikTok',
            username: account.tiktok.username,
            success: true,
            message: 'Posted successfully (simulated)'
          });
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

module.exports = router;