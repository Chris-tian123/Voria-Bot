const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const QuarantineRecord = require('../../lib/QuarantineRecord');
const ModAction = require('../../lib/modAction');
const { PermissionsBitField } = require('discord.js');

class JailCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      description: 'Quarantine a user by removing their roles and assigning a restricted role.',
      category: 'mod',
    });
  }

  async messageRun(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return send(message, ':warning: You are not authorized to use this command.');
    }

    const userInput = await args.pick('string').catch(() => null);
    if (!userInput) return send(message, 'Please provide a valid user mention or ID.');

    const userId = userInput.replace(/[<@!>]/g, '');

    let member;
    try {
      member = await message.guild.members.fetch(userId);
    } catch {
      return send(message, 'User not found in this server.');
    }

    let quarantineRole = message.guild.roles.cache.find(role => role.name === 'Quarantined');
    if (!quarantineRole) {
      try {
        quarantineRole = await message.guild.roles.create({
          name: 'Quarantined',
          color: '4f18ad',
          permissions: [],
        });

        await quarantineRole.setPosition(message.guild.members.me.roles.highest.position - 1);

        message.guild.channels.cache.forEach(async (channel) => {
if (channel.isTextBased()) {// Check if the channel is a text channel
            try {
              await channel.permissionOverwrites.edit(quarantineRole, {
                VIEW_CHANNEL: false,
                SEND_MESSAGES: false,
                CONNECT: false,
                SPEAK: false,
              });
            } catch (err) {
              console.error(`Failed to set permissions in channel ${channel.name}:`, err);
            }
          }
        });
      } catch (error) {
        console.error('Error creating quarantine role:', error);
        return send(message, 'There was an error creating the quarantine role.');
      }
    }

    const oldRoles = member.roles.cache.filter(role => role.id !== message.guild.id).map(role => role.id);
    try {
      const record = new QuarantineRecord({
        userId: member.id,
        guildId: message.guild.id,
        roles: oldRoles,
      });
      await record.save();

      const modAction = new ModAction({
        action: 'Quarantine',
        userId: member.id,
        guildId: message.guild.id,
        moderatorId: message.author.id,
        reason: 'Quarantined by moderator.',
        date: new Date(),
      });
      await modAction.save();

      await member.roles.remove(oldRoles);
      await member.roles.add(quarantineRole);

      return send(message, `${member.user.tag} has been quarantined.`);
    } catch (error) {
      console.error('Failed to quarantine the user:', error);
      return send(message, 'Failed to quarantine the user. Please try again.');
    }
  }
}

module.exports = {
  JailCommand,
};
