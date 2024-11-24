const mongoose = require('mongoose');

const WelcomeConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  welcomeChannelId: { type: String, required: true },
  welcomeMessage: { type: String, default: 'Welcome {user} to {server}!' },
});

module.exports = mongoose.model('WelcomeConfig', WelcomeConfigSchema);
