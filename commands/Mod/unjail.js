const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const QuarantineRecord = require('../../lib/QuarantineRecord');
const ModAction = require('../../lib/modAction');
const { PermissionsBitField } = require('discord.js');
const mongoose = require('mongoose');

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
    if (!userInput) return send(message, 'Please provide a valid user mention, ID, username, or case ID.');

    let member;
    let record;

    try {
      // Handle as User ID (17-19 digits)
      if (/^\d{17,19}$/.test(userInput)) {
        const userId = userInput;

        // Fetch the member
        member = await message.guild.members.fetch(userId);
        if (!member) {
          return send(message, 'User not found in this server.');
        }

        // Query by userId
        record = await QuarantineRecord.findOne({ userId, guildId: message.guild.id });
        if (!record) {
          return send(message, 'No quarantine record found for this user.');
        }
      } else if (mongoose.isValidObjectId(userInput)) {
        // Handle as Case ID (valid ObjectId)
        record = await QuarantineRecord.findOne({ _id: userInput });
        if (record) {
          member = await message.guild.members.fetch(record.userId);
        } else {
          return send(message, 'No quarantine record found for this case ID.');
        }
      } else {
        // Handle as Username or Mention
        member = message.guild.members.cache.find(
          (m) => m.user.username === userInput || m.displayName === userInput || m.user.tag === userInput
        );

        if (member) {
          record = await QuarantineRecord.findOne({ userId: member.id, guildId: message.guild.id });
        }

        if (!record) return send(message, 'No quarantine record found for this user.');
      }

      if (!record) return send(message, 'No quarantine record found for this user or case ID.');

      // Restore the user's previous roles
      const rolesToRestore = record.roles;
      await member.roles.set(rolesToRestore);

      // Remove the quarantine role
      const quarantineRole = message.guild.roles.cache.find(role => role.name === 'Quarantined');
      if (quarantineRole) {
        await member.roles.remove(quarantineRole);
      }
      const modAction = new ModAction({
        action: 'Un-Quarantine',
        userId: member.id,
        guildId: message.guild.id,
        moderatorId: message.author.id,
        reason: 'Un-Quarantined by moderator.',
        date: new Date(),
      });
      await modAction.save();
      // Remove the quarantine record from the database
      await QuarantineRecord.deleteOne({ userId: member.id, guildId: message.guild.id });

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
