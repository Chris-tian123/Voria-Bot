const { Listener } = require('@sapphire/framework');
const AutoResponder = require('../../lib/AutoResponder');

class MessageResponderListener extends Listener {
  constructor(context, options) {
    super(context, {
      ...options,
      event: 'messageCreate',
    });
  }

  async run(message) {
    if (message.author.bot || !message.guild) return; // Ignore bot messages and DMs

    const responders = await AutoResponder.find({ guildId: message.guild.id });
    if (!responders.length) return; // No responders configured

    // Check if any trigger exactly matches the entire message content
    const trigger = responders.find((res) => message.content.trim().toLowerCase() === res.trigger.toLowerCase());
    if (!trigger) return; // No matching trigger found

    await message.channel.send(trigger.response);
  }
}

module.exports = {
  MessageResponderListener,
};
