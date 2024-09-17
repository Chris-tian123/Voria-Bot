const { Command } = require('@sapphire/framework');
const { EmbedBuilder } = require('discord.js');
const { PermissionsBitField } = require("discord.js")

class DMCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      category: 'mod',
      permissions: [PermissionsBitField.Flags.ManageMessages],
      description: 'Send a DM to a specified user',
    });
  }

  async messageRun(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return send(message, ':warning: You are not Authorized to use this command');
    }
    const user = await args.pick('user').catch(() => null);
    const content = await args.rest('string').catch(() => null);

    if (!user) {
      return message.channel.send('Please provide a user to send a DM to.');
    }

    if (!content) {
      return message.channel.send('Please provide the content of the DM.');
    }

    try {
      // Create a DM channel with the user
      const dmChannel = await user.createDM();
      
      // Create an embed for the DM message
      const dmMessage = new EmbedBuilder()
        .setTitle('<:topggBotReviewer:1264944752835563587> Direct Message from Bot')
        .setDescription(content)
        .setColor('#00FF00')
        .setFooter({ text: `Sent by ${message.author.tag}`});

      // Send the DM
      await dmChannel.send({ embeds: [dmMessage] });

      // Notify the original channel
      await message.channel.send(`Successfully sent a DM to ${user.tag}.`);
    } catch (error) {
      console.error('Failed to send DM:', error);
      await message.channel.send('Failed to send a DM to the user. They might have DMs disabled or there might be another issue.');
    }
  }
}

module.exports = {
  DMCommand,
};
