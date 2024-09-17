const { Schema, model } = require('mongoose');

const quarantineRecordSchema = new Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  roles: { type: [String], required: true }, // Array of role IDs
  reason: { type: String, default: 'No reason provided' },
  date: { type: Date, default: Date.now }
});

module.exports = model('QuarantineRecord', quarantineRecordSchema);
