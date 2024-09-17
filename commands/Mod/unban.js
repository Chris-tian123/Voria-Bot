const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const ModAction = require('../../lib/modAction'); // Replace with the actual path to your ModAction model
const { PermissionsBitField } = require('discord.js');

class UnbanCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      category: 'mod',
      aliases: ['ub'],
      description: 'Unban a member using their user ID or the mod action ID',
    });
  }

  async messageRun(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return send(message, ':warning: You are not Authorized to use this command');
    }

    const identifier = await args.pick('string').catch(() => null);

    if (!identifier) {
      return send(message, 'Please provide a user ID or mod action ID.');
    }

    // Try to find the user by user ID first
    let user;
    try {
      user = await message.client.users.fetch(identifier);
    } catch {
      // If not found by user ID, try to find by mod action ID
      const modAction = await ModAction.findById(identifier).catch(() => null);
      if (modAction) {
        try {
          user = await message.client.users.fetch(modAction.userId);
        } catch {
          return send(message, 'User not found.');
        }
      }
    }

    if (!user) {
      return send(message, 'User not found.');
    }

    try {
      await message.guild.members.unban(user.id);
      return send(message, `Successfully un-banned ${user.tag} (${user.id}).`);
    } catch (error) {
      console.error('Failed to unban the user:', error);
      return send(message, 'Failed to unban the user. Please check the user ID or mod action ID and try again.');
    }

    // Log the action in the ModAction collection
    const modAction = new ModAction({
      action: 'Un-Ban',
      userId: user.id,
      moderatorId: message.author.username,
      reason,
      date: new Date()
    });
    await modAction.save();
  }
}
module.exports = {
  UnbanCommand
};
