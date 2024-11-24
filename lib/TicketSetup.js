const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  guildId: String,
  staffRoleId: String,
  categoryId: String,
  ticketName: String,
});

module.exports = mongoose.model('TicketSetup', ticketSchema);
