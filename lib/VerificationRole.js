// models/VerificationRole.js
const { Schema, model } = require('mongoose');

const verificationRoleSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  roleId: { type: String, required: true }
});

module.exports = model('VerificationRole', verificationRoleSchema);
