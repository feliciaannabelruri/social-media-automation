const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  instagram: {
    username: String,
    password: String,
    enabled: Boolean,
    sessionData: Object
  },
  tiktok: {
    username: String,
    password: String,
    enabled: Boolean,
    sessionData: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Account', accountSchema);
