const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const ModAction = require('../../lib/modAction');
const { EmbedBuilder } = require('discord.js');
const { PermissionsBitField } = require("discord.js")

class MuteCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      category: 'mod',
      permissions: [PermissionsBitField.Flags.ManageMessages],
      description: 'Mute (timeout) a user in the server'
    });
  }

  async messageRun(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.TimeoutMembers)) {
      return send(message, ':warning: You are not Authorized to use this command');
    }
    const userId = await args.pick('string').catch(() => null);
    const duration = await args.pick('number').catch(() => null);
    const reason = await args.rest('string').catch(() => 'No reason provided');

    if (!userId || !duration) {
      return send(message, 'Please provide a valid user ID and duration in minutes.');
    }

    const timeoutDuration = duration * 60 * 1000; // Convert minutes to milliseconds

    try {
      const member = await message.guild.members.fetch(userId).catch(() => null);
      if (!member) {
        return send(message, 'User not found in the server or not cached.');
      }

      await member.timeout(timeoutDuration, reason);
      const now = new Date(Date.now()).toLocaleString();
      const modAction = new ModAction({
        userId: member.id,
        action: 'Mute',
        reason,
        duration: timeoutDuration,
        moderatorId: message.author.username
      });
  
      await modAction.save();
  
      const caseId = modAction._id.toString();
      
      const muteMessage = `<:muted_KNL:1264938092285005877> **${member.user.tag}** was muted by **${message.author.tag}** with the Case Id **${caseId}** on **${now}** for **${duration}** minutes for: **${reason}**`;

      // Send the message to the channel
      await send(message, muteMessage);

      // Attempt to send the message to the user's DM
      try {
        await member.send(muteMessage);
      } catch (err) {
        console.error('Failed to send DM to muted user:', err);
      }

    } catch (error) {
      console.error('Error muting user:', error);
      return send(message, `There was an error trying to mute the user: ${error.message}`);
    }
  }
}

module.exports = {
  MuteCommand
};
