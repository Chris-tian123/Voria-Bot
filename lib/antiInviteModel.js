const mongoose = require('mongoose');

const antiInviteSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  warningCount: { type: Number, default: 0 },
  userId: { type: String, required: true, unique: true },
});

const AntiInviteSettings = mongoose.model('AntiInviteSettings', antiInviteSchema);
module.exports = AntiInviteSettings;
