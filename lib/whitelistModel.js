// whitelistModel.js
const mongoose = require('mongoose');

const whitelistSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  links: { type: [String], default: [] },
});

module.exports = mongoose.model('Whitelist', whitelistSchema);
