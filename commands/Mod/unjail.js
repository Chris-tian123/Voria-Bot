const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const QuarantineRecord = require('../../lib/QuarantineRecord');
const ModAction = require('../../lib/modAction');
const { PermissionsBitField } = require('discord.js');

class UnjailCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      description: 'Unquarantine a user by restoring their roles and removing the quarantine restrictions.',
      category: 'mod',
    });
  }

  async messageRun(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return send(message, ':warning: You are not authorized to use this command.');
    }

    const userInput = await args.pick('string').catch(() => null);
    if (!userInput) return send(message, 'Please provide a valid user mention, ID, or case ID.');

    let member;
    let record;
    let caseIdQuery = { _id: userInput };
    if (/^\d{17,19}$/.test(userInput)) {
      // Handle as User ID
      const userId = userInput;
      try {
        member = await message.guild.members.fetch(userId);
      } catch {
        return send(message, 'User not found in this server.');
      }
      record = await QuarantineRecord.findOne({ userId, guildId: message.guild.id });
    } else {
      // Handle as Case ID
      record = await QuarantineRecord.findOne(caseIdQuery);
      if (record) {
        member = await message.guild.members.fetch(record.userId);
      }
    }

    if (!record) return send(message, 'No quarantine record found for this user or case ID.');

    try {
      // Restore the user's previous roles
      const rolesToRestore = record.roles;
      await member.roles.set(rolesToRestore);

      // Remove the quarantine role
      const quarantineRole = message.guild.roles.cache.find(role => role.name === 'Quarantined');
      if (quarantineRole) {
        await member.roles.remove(quarantineRole);
      }

      // Remove the quarantine record from the database
      await QuarantineRecord.deleteOne({ userId: member.id, guildId: message.guild.id });

      // Remove the associated ModAction entry
      await ModAction.findOneAndDelete(caseIdQuery);

      return send(message, `${member.user.tag} has been unquarantined and their roles have been restored.`);
    } catch (error) {
      console.error('Failed to unquarantine the user:', error);
      return send(message, 'Failed to unquarantine the user. Please check permissions and try again.');
    }
  }
}

module.exports = {
  UnjailCommand,
};
