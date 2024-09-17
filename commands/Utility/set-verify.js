// commands/admin/SetVerifyRole.js
const { Command } = require('@sapphire/framework');
const { PermissionsBitField } = require('discord.js');
const VerificationRole = require('../../lib/VerificationRole');

class SetVerifyRoleCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'set-verify',
      category: 'utility',
      description: 'Set the role to be given upon verification.',
    });
  }

  async messageRun(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return send(message, ':warning: You are not Authorized to use this command');
    }
    const role = await args.pick('role').catch(() => null);

    if (!role) {
      return message.reply('Please mention a valid role to set as the verification role.');
    }

    await VerificationRole.findOneAndUpdate(
      { guildId: message.guild.id },
      { roleId: role.id },
      { upsert: true, new: true }
    );

    return message.reply(`Verification role has been set to ${role.name}.`);
  }
}

module.exports = {
  SetVerifyRoleCommand,
};
