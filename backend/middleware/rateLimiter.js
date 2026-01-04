const rateLimit = require('express-rate-limit');

// Limit posting to prevent spam
const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 posts per 15 minutes
  message: 'Terlalu banyak request, coba lagi nanti'
});

// Limit login attempts
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // max 5 login attempts per hour
  message: 'Terlalu banyak percobaan login, coba lagi nanti'
});

module.exports = {
  postLimiter,
  loginLimiter
};