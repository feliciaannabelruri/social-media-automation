const express = require('express');
const router = express.Router();
const Account = require('../models/Account');
const logger = require('../utils/logger');

// ============================================
// GET /api/accounts
// Get all accounts
// ============================================
router.get('/', async (req, res) => {
  try {
    const accounts = await Account.find().sort({ createdAt: -1 });
    res.json(accounts);
  } catch (error) {
    logger.error(`Get accounts error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// POST /api/accounts
// Create new account
// ============================================
router.post('/', async (req, res) => {
  try {
    const { name, instagram, tiktok } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ error: 'Account name is required' });
    }

    if (!instagram?.enabled && !tiktok?.enabled) {
      return res.status(400).json({ error: 'At least one platform must be enabled' });
    }

    // Create account
    const account = new Account({
      name,
      instagram: instagram || { enabled: false },
      tiktok: tiktok || { enabled: false }
    });

    await account.save();

    logger.success(`Account created: ${name}`);
    res.status(201).json(account);
  } catch (error) {
    logger.error(`Create account error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PUT /api/accounts/:id
// Update account
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, instagram, tiktok } = req.body;

    const account = await Account.findByIdAndUpdate(
      id,
      { name, instagram, tiktok },
      { new: true, runValidators: true }
    );

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    logger.success(`Account updated: ${name}`);
    res.json(account);
  } catch (error) {
    logger.error(`Update account error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DELETE /api/accounts/:id
// Delete account
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const account = await Account.findByIdAndDelete(id);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    logger.success(`Account deleted: ${account.name}`);
    res.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    logger.error(`Delete account error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GET /api/accounts/:id
// Get single account
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const account = await Account.findById(id);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    logger.error(`Get account error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;