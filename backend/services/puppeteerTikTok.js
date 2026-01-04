const puppeteer = require('puppeteer');
const Account = require('../models/Account');

async function postToTikTokPuppeteer(accountId, videoPath, caption) {
  const account = await Account.findById(accountId);
  
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Login ke TikTok
    await page.goto('https://www.tiktok.com/login');
    
    await page.type('input[name="username"]', account.tiktok.username);
    await page.type('input[name="password"]', account.tiktok.password);
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation();
    
    // Navigate ke upload page
    await page.goto('https://www.tiktok.com/upload');
    
    // Upload video
    const inputFile = await page.$('input[type="file"]');
    await inputFile.uploadFile(videoPath);
    
    // Wait for upload
    await page.waitForSelector('.caption-input', { timeout: 60000 });
    
    // Add caption
    await page.type('.caption-input', caption);
    
    // Click post
    await page.click('button.post-button');
    
    await page.waitForNavigation();
    
    return { success: true, message: 'Posted to TikTok' };
  } catch (error) {
    return { success: false, message: error.message };
  } finally {
    await browser.close();
  }
}

module.exports = { postToTikTokPuppeteer };