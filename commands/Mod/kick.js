const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const ModAction = require('../../lib/modAction');
const { EmbedBuilder } = require('discord.js');
const { PermissionsBitField } = require("discord.js")

class KickCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      category: 'mod',
      permissions: [PermissionsBitField.Flags.ManageMessages],
      description: 'Kick a user from the server'
    });
  }

  async messageRun(message, args) {
     if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return send(message, ':warning: You are not Authorized to use this command');
    }
      
    const userId = await args.pick('string').catch(() => null);
    const reason = await args.rest('string').catch(() => 'No reason provided');

    if (!userId) {
      return send(message, 'Please provide a valid user ID.');
    }

    try {
      // Fetch the user to kick
      const user = await message.guild.members.fetch(userId);
      if (!user) {
        return send(message, 'User not found.');
      }

      // Kick the user by ID
      await user.kick(reason);
      
      const now = new Date(Date.now()).toLocaleString();

      // Create a new mod action log
      const modAction = new ModAction({
        userId: userId,
        action: 'kick',
        reason,
        moderatorId: message.author.username
      });

      // Save the mod action to get its ID
      await modAction.save();
      
      // Retrieve the unique ID for the log entry
      const caseId = modAction._id.toString();

      // Create and send the kick confirmation message
      const kickMessage = `<:kick:1264938456245731351> *${user.user.tag}* was kicked by *${message.author.tag}* with the Case Id *${caseId}* on *${now}* for: *${reason}*`;

      // Send the message to the channel
      await send(message, kickMessage);

      // Attempt to send the message to the user's DM
      try {
        await user.send(kickMessage);
      } catch (err) {
        console.error('Failed to send DM to kicked user:', err);
      }

    } catch (error) {
      console.error('Error kicking user:', error);
      return send(message, `There was an error trying to kick the user: ${error.message}`);
    }
  }
}

module.exports = {
  KickCommand
};
