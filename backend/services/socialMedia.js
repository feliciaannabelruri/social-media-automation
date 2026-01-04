const { IgApiClient } = require('instagram-private-api');
const Account = require('../models/Account');
const fs = require('fs');

// Instagram Posting
async function postToInstagram(accountId, mediaPath, caption) {
  try {
    const account = await Account.findById(accountId);
    
    if (!account.instagram.enabled) {
      return { success: false, message: 'Instagram not enabled' };
    }

    const ig = new IgApiClient();
    ig.state.generateDevice(account.instagram.username);
    
    // Login
    await ig.account.login(account.instagram.username, account.instagram.password);
    
    // Upload photo/video
    const mediaBuffer = fs.readFileSync(mediaPath);
    
    const publishResult = await ig.publish.photo({
      file: mediaBuffer,
      caption: caption
    });
    
    return { 
      success: true, 
      message: 'Posted to Instagram',
      postId: publishResult.media.id 
    };
  } catch (error) {
    return { 
      success: false, 
      message: error.message 
    };
  }
}

// TikTok Posting (menggunakan unofficial API)
async function postToTikTok(accountId, mediaPath, caption) {
  try {
    const account = await Account.findById(accountId);
    
    if (!account.tiktok.enabled) {
      return { success: false, message: 'TikTok not enabled' };
    }

    // Note: TikTok tidak memiliki official API untuk posting
    // Anda perlu menggunakan solusi seperti:
    // 1. TikTok Business API (berbayar)
    // 2. Selenium/Puppeteer untuk automation browser
    // 3. Third-party services
    
    // Contoh placeholder:
    console.log('Posting to TikTok:', {
      username: account.tiktok.username,
      caption: caption,
      video: mediaPath
    });
    
    return { 
      success: true, 
      message: 'Posted to TikTok (simulated)' 
    };
  } catch (error) {
    return { 
      success: false, 
      message: error.message 
    };
  }
}

module.exports = {
  postToInstagram,
  postToTikTok
};