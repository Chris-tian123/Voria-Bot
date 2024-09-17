const mongoose = require('mongoose');

const giveawaySchema = new mongoose.Schema({
    guildId: String,
    channelId: String,
    messageId: String,
    prize: String,
    endTime: Date,
    participants: [String],
    winner: String
});

const Giveaway = mongoose.model('Giveaway', giveawaySchema);

module.exports = Giveaway;
