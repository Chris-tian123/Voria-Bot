const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const { PermissionsBitField } = require('discord.js');
const ModAction = require('../../lib/modAction'); // Adjust the path to your ModAction model

class HackbanCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      description: 'Ban a user by their ID, even if they are not in the server.',
      category: 'mod',
    });
  }

  async messageRun(message, args) {
    // Check if the command user has the required permissions
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return send(message, ':warning: You are not authorized to use this command.');
    }

    // Fetch the user ID and reason from the command arguments
    const userId = await args.pick('string').catch(() => null);
    const reason = await args.rest('string').catch(() => 'No reason provided.');

    if (!userId || !/^\d{17,19}$/.test(userId)) {
      return send(message, 'Please provide a valid user ID.');
    }

    try {
      // Ban the user by their ID with the provided reason
      await message.guild.members.ban(userId, { reason });

      // Log the action in the ModAction collection
      const modAction = new ModAction({
        userId,
        action: 'Hackban',
        reason,
        moderatorId: message.author.id,
        guildId: message.guild.id,
        timestamp: new Date(),
      });

      await modAction.save();

      // Send a confirmation message with the case ID
      const caseId = modAction._id.toString();
      return send(message, `User with ID **${userId}** has been banned for: **${reason}**. Case ID: **${caseId}**`);
    } catch (error) {
      console.error('Failed to hackban the user:', error);
      if (error.code === 10013) {
        return send(message, 'Invalid user ID provided. The user may not exist.');
      }
      return send(message, 'Failed to ban the user. Please check permissions and try again.');
    }
  }
}

module.exports = {
  HackbanCommand,
};
