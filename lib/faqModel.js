const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  alias: { type: [String], default: [] },
  question: { type: String, required: true },
  answer: { type: String, required: true }
});

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;
