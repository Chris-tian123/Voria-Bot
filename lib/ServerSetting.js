// models/ServerSettings.js
const mongoose = require('mongoose');

const serverSettingsSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  autoBanNewAccounts: { type: Boolean, default: false }
});

module.exports = mongoose.model('ServerSettings', serverSettingsSchema);
