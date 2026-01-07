// FILE: backend/services/instagramService.js
const { IgApiClient } = require('instagram-private-api');
const fs = require('fs');
const path = require('path');
const Account = require('../models/Account');
const logger = require('../utils/logger');

class InstagramService {
  constructor() {
    this.clients = new Map(); // Cache client instances
  }

  /**
   * Get or create Instagram client for an account
   */
  async getClient(account) {
    const cacheKey = account._id.toString();
    
    if (this.clients.has(cacheKey)) {
      return this.clients.get(cacheKey);
    }

    const ig = new IgApiClient();
    ig.state.generateDevice(account.instagram.username);
    
    // Load session if exists
    if (account.instagram.sessionData) {
      try {
        await ig.state.deserialize(account.instagram.sessionData);
        logger.info(`Loaded Instagram session for @${account.instagram.username}`);
      } catch (error) {
        logger.warning(`Failed to load session, will re-login: ${error.message}`);
      }
    }

    this.clients.set(cacheKey, ig);
    return ig;
  }

  /**
   * Login to Instagram
   */
  async login(account) {
    try {
      const ig = await this.getClient(account);
      
      logger.info(`Logging in to Instagram as @${account.instagram.username}...`);
      
      const auth = await ig.account.login(
        account.instagram.username,
        account.instagram.password
      );

      // Save session data
      const serialized = await ig.state.serialize();
      delete serialized.constants;
      
      account.instagram.sessionData = serialized;
      await account.save();

      logger.success(`✓ Instagram login successful: @${account.instagram.username}`);
      
      return { success: true, userId: auth.pk };
    } catch (error) {
      logger.error(`Instagram login failed: ${error.message}`);
      
      // Handle specific errors
      if (error.message.includes('challenge_required')) {
        return {
          success: false,
          error: 'Challenge required - please login manually first',
          needsChallenge: true
        };
      }
      
      if (error.message.includes('checkpoint_required')) {
        return {
          success: false,
          error: 'Checkpoint required - verify your account',
          needsVerification: true
        };
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Post photo to Instagram
   */
  async postPhoto(account, imagePath, caption) {
    try {
      const ig = await this.getClient(account);

      logger.info(`Posting photo to Instagram @${account.instagram.username}...`);

      // Read image file
      const imageBuffer = fs.readFileSync(imagePath);

      // Upload photo
      const publishResult = await ig.publish.photo({
        file: imageBuffer,
        caption: caption
      });

      logger.success(`✓ Instagram post successful: ${publishResult.media.code}`);

      return {
        success: true,
        postId: publishResult.media.id,
        code: publishResult.media.code,
        url: `https://www.instagram.com/p/${publishResult.media.code}/`
      };

    } catch (error) {
      logger.error(`Instagram post failed: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Post video to Instagram
   */
  async postVideo(account, videoPath, caption, coverImagePath = null) {
    try {
      const ig = await this.getClient(account);

      logger.info(`Posting video to Instagram @${account.instagram.username}...`);

      // Read video file
      const videoBuffer = fs.readFileSync(videoPath);
      
      // Read cover image if provided
      let coverImage;
      if (coverImagePath && fs.existsSync(coverImagePath)) {
        coverImage = fs.readFileSync(coverImagePath);
      }

      // Upload video
      const publishResult = await ig.publish.video({
        video: videoBuffer,
        coverImage: coverImage,
        caption: caption
      });

      logger.success(`✓ Instagram video post successful: ${publishResult.media.code}`);

      return {
        success: true,
        postId: publishResult.media.id,
        code: publishResult.media.code,
        url: `https://www.instagram.com/p/${publishResult.media.code}/`
      };

    } catch (error) {
      logger.error(`Instagram video post failed: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get media type from file
   */
  getMediaType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const videoExts = ['.mp4', '.mov', '.avi'];
    const imageExts = ['.jpg', '.jpeg', '.png'];
    
    if (videoExts.includes(ext)) return 'video';
    if (imageExts.includes(ext)) return 'photo';
    return 'unknown';
  }

  /**
   * Post media (auto-detect type)
   */
  async postMedia(account, mediaPath, caption) {
    try {
      const ig = await this.getClient(account);

      // ALWAYS login first to ensure fresh session
      logger.info('Ensuring Instagram session is valid...');
      
      if (!ig.state.cookieUserId) {
        logger.info('No session found, logging in...');
        const loginResult = await this.login(account);
        
        if (!loginResult.success) {
          return loginResult;
        }
      } else {
        logger.info('Session exists, verifying...');
        
        // Try to verify session is still valid
        try {
          await ig.account.currentUser();
          logger.success('✓ Session is valid');
        } catch (error) {
          logger.warning('Session expired, re-logging in...');
          
          // Session expired, login again
          const loginResult = await this.login(account);
          if (!loginResult.success) {
            return loginResult;
          }
        }
      }

      // Now post the media
      const mediaType = this.getMediaType(mediaPath);
      
      if (mediaType === 'photo') {
        return await this.postPhoto(account, mediaPath, caption);
      } else if (mediaType === 'video') {
        return await this.postVideo(account, mediaPath, caption);
      } else {
        return {
          success: false,
          error: 'Unsupported media type'
        };
      }
    } catch (error) {
      logger.error(`postMedia failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Logout and clear session
   */
  async logout(accountId) {
    const cacheKey = accountId.toString();
    
    if (this.clients.has(cacheKey)) {
      const ig = this.clients.get(cacheKey);
      try {
        await ig.account.logout();
        logger.info('Instagram logout successful');
      } catch (error) {
        logger.warning(`Logout warning: ${error.message}`);
      }
      this.clients.delete(cacheKey);
    }
  }
}

// Export singleton instance
module.exports = new InstagramService();