// FILE: backend/routes/posts.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Account = require('../models/Account');
const instagramService = require('../services/instagramService');
const tiktokService = require('../services/tiktokService');
const logger = require('../utils/logger');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    
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
// REAL posting to Instagram & TikTok
// ============================================
router.post('/create', upload.single('media'), async (req, res) => {
  try {
    logger.info('========================================');
    logger.info('🚀 REAL Post Request Received');
    logger.info('========================================');
    
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
    
    logger.info(`Processing REAL post for ${accounts.length} accounts`);
    logger.info(`Caption: ${caption.substring(0, 50)}...`);
    logger.info(`Media: ${req.file.filename}`);
    logger.info(`File size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);
    
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
        
        // ============================================
        // REAL INSTAGRAM POSTING
        // ============================================
        if (account.instagram && account.instagram.enabled) {
          logger.info(`🔵 REAL Instagram posting for @${account.instagram.username}...`);
          
          try {
            const igResult = await instagramService.postMedia(
              account,
              mediaPath,
              caption
            );
            
            if (igResult.success) {
              logger.success(`✓ Instagram posted: ${igResult.url}`);
              results.push({
                accountId,
                accountName: account.name,
                platform: 'Instagram',
                username: account.instagram.username,
                success: true,
                message: 'Posted successfully',
                url: igResult.url,
                postId: igResult.postId
              });
            } else {
              logger.error(`✗ Instagram failed: ${igResult.error}`);
              results.push({
                accountId,
                accountName: account.name,
                platform: 'Instagram',
                username: account.instagram.username,
                success: false,
                message: igResult.error,
                needsChallenge: igResult.needsChallenge,
                needsVerification: igResult.needsVerification
              });
            }
          } catch (error) {
            logger.error(`Instagram exception: ${error.message}`);
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
        
        // ============================================
        // REAL TIKTOK POSTING
        // ============================================
        if (account.tiktok && account.tiktok.enabled) {
          // Check if file is video FIRST
          const isVideo = /\.(mp4|mov|avi|mkv)$/i.test(req.file.filename);
          
          if (!isVideo) {
            logger.warning(`⏭️  Skipping TikTok for @${account.tiktok.username} - Image not supported (TikTok only accepts video)`);
            results.push({
              accountId,
              accountName: account.name,
              platform: 'TikTok',
              username: account.tiktok.username,
              success: false,
              message: 'Skipped - TikTok only accepts video files (MP4, MOV, AVI, MKV)',
              skipped: true
            });
            continue;
          }
          
          logger.info(`🎵 REAL TikTok posting for @${account.tiktok.username}...`);
          
          try {
            const ttResult = await tiktokService.postVideo(
              account,
              mediaPath,
              caption
            );
            
            if (ttResult.success) {
              logger.success(`✓ TikTok posted successfully`);
              results.push({
                accountId,
                accountName: account.name,
                platform: 'TikTok',
                username: account.tiktok.username,
                success: true,
                message: 'Posted successfully',
                url: ttResult.url
              });
            } else {
              logger.error(`✗ TikTok failed: ${ttResult.error}`);
              results.push({
                accountId,
                accountName: account.name,
                platform: 'TikTok',
                username: account.tiktok.username,
                success: false,
                message: ttResult.error
              });
            }
          } catch (error) {
            logger.error(`TikTok exception: ${error.message}`);
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
    
    logger.info('========================================');
    logger.success(`🎉 REAL Posting completed`);
    logger.info(`✓ Success: ${results.filter(r => r.success).length}`);
    logger.info(`✗ Failed: ${results.filter(r => !r.success).length}`);
    logger.info('========================================');
    
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

// ============================================
// POST /api/posts/test-instagram
// Test Instagram connection
// ============================================
router.post('/test-instagram', async (req, res) => {
  try {
    const { accountId } = req.body;
    
    const account = await Account.findById(accountId);
    
    if (!account || !account.instagram.enabled) {
      return res.status(400).json({
        success: false,
        error: 'Account not found or Instagram not enabled'
      });
    }
    
    const result = await instagramService.login(account);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// POST /api/posts/test-tiktok
// Test TikTok connection
// ============================================
router.post('/test-tiktok', async (req, res) => {
  try {
    const { accountId } = req.body;
    
    const account = await Account.findById(accountId);
    
    if (!account || !account.tiktok.enabled) {
      return res.status(400).json({
        success: false,
        error: 'Account not found or TikTok not enabled'
      });
    }
    
    const result = await tiktokService.login(account);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;