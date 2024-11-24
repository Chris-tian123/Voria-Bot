const { Command } = require('@sapphire/framework');
const WelcomeConfig = require('../../lib/WelcomeConfig');
const { PermissionsBitField } = require('discord.js')
class ConfigureWelcomeCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      description: 'Configure the welcome message and channel.',
      category: 'utility'
    });
  }

  async messageRun(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return send(message, ':warning: You are not Authorized to use this command');
    }
    const welcomeChannel = await args.pick('guildTextChannel').catch(() => null);
    const welcomeMessage = await args.rest('string').catch(() => 'Welcome {user} to {server}!');

    if (!welcomeChannel) {
      return message.channel.send('Please specify a valid text channel.');
    }

    await WelcomeConfig.findOneAndUpdate(
      { guildId: message.guild.id },
      {
        guildId: message.guild.id,
        welcomeChannelId: welcomeChannel.id,
        welcomeMessage,
      },
      { upsert: true }
    );

    return message.channel.send(`Welcome configuration updated for ${welcomeChannel} with message: "${welcomeMessage}"`);
  }
}

module.exports = {
  ConfigureWelcomeCommand,
};
