const express = require('express');
const router = express.Router();
const multer = require('multer');
const { postToInstagram, postToTikTok } = require('../services/socialMedia');

const upload = multer({ dest: 'uploads/' });

router.post('/create', upload.single('media'), async (req, res) => {
  try {
    const { caption, accountIds } = req.body;
    const mediaPath = req.file.path;
    
    const results = [];
    
    for (const accountId of JSON.parse(accountIds)) {
      // Post to Instagram
      const igResult = await postToInstagram(accountId, mediaPath, caption);
      results.push({ platform: 'instagram', ...igResult });
      
      // Post to TikTok
      const ttResult = await postToTikTok(accountId, mediaPath, caption);
      results.push({ platform: 'tiktok', ...ttResult });
    }
    
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;