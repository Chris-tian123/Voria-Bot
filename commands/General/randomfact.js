const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

class FunFactCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      aliases: ['rf'],
      category: 'general',
      description: 'Get a random fun fact!',
    });
  }

  async messageRun(message) {
    try {
      // Fetch random fun fact from the API
      const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
      const funFact = response.data.text;

      // Define the custom emoji (Replace with your custom emoji)
      const customEmoji = '<:yourEmojiName:emojiID>'; // Example: '<:funFact:123456789012345678>'

      // Create an embed message with the fun fact and the custom emoji
      const embed = new EmbedBuilder()
        .setDescription(`:thinking: ${funFact}`)
        .setColor('#ffcc00') // You can change the color as per your choice
        .setTimestamp();

      // Send the embed as a reply
      return send(message, { embeds: [embed] });
    } catch (error) {
      console.error('Error fetching fun fact:', error);

      // Send an error message if the API call fails
      return send(message, 'Sorry, I couldn\'t retrieve a fun fact at this time. Please try again later.');
    }
  }
}

module.exports = {
  FunFactCommand
};
