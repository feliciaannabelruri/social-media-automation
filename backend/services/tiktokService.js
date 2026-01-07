// FILE: backend/services/tiktokService.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const Account = require('../models/Account');
const logger = require('../utils/logger');

class TikTokService {
  constructor() {
    this.browser = null;
    this.pages = new Map();
  }

  /**
   * Initialize browser
   */
  async initBrowser() {
    if (!this.browser) {
      logger.info('Launching browser for TikTok...');
      
      this.browser = await puppeteer.launch({
        headless: false, // Set true for production
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080'
        ],
        defaultViewport: {
          width: 1920,
          height: 1080
        }
      });

      logger.success('Browser launched successfully');
    }
    
    return this.browser;
  }

  /**
   * Login to TikTok
   */
  async login(account) {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      logger.info(`Logging in to TikTok as @${account.tiktok.username}...`);

      // Go to TikTok login page
      await page.goto('https://www.tiktok.com/login/phone-or-email/email', {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      // Wait for login form
      await page.waitForSelector('input[name="username"]', { timeout: 10000 });

      // Fill credentials
      await page.type('input[name="username"]', account.tiktok.username, {
        delay: 100 // Simulate human typing
      });
      
      await page.type('input[type="password"]', account.tiktok.password, {
        delay: 100
      });

      // Click login button
      await page.click('button[type="submit"]');

      // Wait for navigation
      await page.waitForNavigation({
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Check if login successful
      const currentUrl = page.url();
      
      if (currentUrl.includes('/login')) {
        throw new Error('Login failed - please check credentials');
      }

      // Save session cookies
      const cookies = await page.cookies();
      account.tiktok.sessionData = { cookies };
      await account.save();

      this.pages.set(account._id.toString(), page);

      logger.success(`✓ TikTok login successful: @${account.tiktok.username}`);

      return {
        success: true,
        message: 'Login successful'
      };

    } catch (error) {
      logger.error(`TikTok login failed: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Post video to TikTok
   */
  async postVideo(account, videoPath, caption) {
    try {
      const browser = await this.initBrowser();
      let page = this.pages.get(account._id.toString());

      // Create new page if not exists
      if (!page) {
        page = await browser.newPage();
        
        // Restore session if exists
        if (account.tiktok.sessionData && account.tiktok.sessionData.cookies) {
          await page.setCookie(...account.tiktok.sessionData.cookies);
          logger.info('Restored TikTok session from cookies');
        } else {
          // Need to login first
          const loginResult = await this.login(account);
          if (!loginResult.success) {
            return loginResult;
          }
          page = this.pages.get(account._id.toString());
        }
      }

      logger.info(`Posting video to TikTok @${account.tiktok.username}...`);

      // Go to upload page
      await page.goto('https://www.tiktok.com/upload', {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      // Wait for file input
      await page.waitForSelector('input[type="file"]', { timeout: 30000 });

      // Upload video file
      const fileInput = await page.$('input[type="file"]');
      await fileInput.uploadFile(videoPath);

      logger.info('Video file uploaded, waiting for processing...');

      // Wait for video to process (this can take a while)
      await page.waitForSelector('.DraftEditor-editorContainer', {
        timeout: 120000 // 2 minutes
      });

      // Add caption
      await page.click('.DraftEditor-editorContainer');
      await page.keyboard.type(caption, { delay: 50 });

      logger.info('Caption added, waiting for post button...');

      // Wait a bit for UI to update
      await page.waitForTimeout(3000);

      // Click post button
      const postButton = await page.$('button[type="button"]:has-text("Post")') ||
                        await page.$('div[role="button"]:has-text("Post")');
      
      if (postButton) {
        await postButton.click();
        logger.info('Post button clicked, waiting for confirmation...');

        // Wait for post to complete
        await page.waitForTimeout(10000);

        // Check if successfully posted
        const currentUrl = page.url();
        
        if (currentUrl.includes('/upload')) {
          // Still on upload page, might have failed
          throw new Error('Post might have failed - still on upload page');
        }

        logger.success(`✓ TikTok post successful: @${account.tiktok.username}`);

        return {
          success: true,
          message: 'Posted successfully to TikTok',
          url: currentUrl
        };
      } else {
        throw new Error('Post button not found');
      }

    } catch (error) {
      logger.error(`TikTok post failed: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Close browser and cleanup
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.pages.clear();
      logger.info('Browser closed and cleaned up');
    }
  }

  /**
   * Logout specific account
   */
  async logout(accountId) {
    const page = this.pages.get(accountId.toString());
    
    if (page) {
      await page.close();
      this.pages.delete(accountId.toString());
      logger.info('TikTok page closed for account');
    }
  }
}

// Export singleton instance
module.exports = new TikTokService();