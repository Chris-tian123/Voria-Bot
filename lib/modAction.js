const mongoose = require('mongoose');

const modActionSchema = new mongoose.Schema({
  userId: String,
  action: String,
  reason: String,
  duration: Number,
  moderatorId: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ModAction', modActionSchema);
