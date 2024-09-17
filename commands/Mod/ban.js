const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const ModAction = require('../../lib/modAction');
const { PermissionsBitField } = require("discord.js")

class BanCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      permissions: [PermissionsBitField.Flags.ManageMessages],
      category: 'mod',  
      description: 'Ban a user'
    });
  }

  async messageRun(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return send(message, ':warning: You are not Authorized to use this command');
    }
    // Fetch the user to ban
    const member = await args.pick('member').catch(() => null);
    const reason = await args.rest('string').catch(() => 'No reason provided');

    if (!member) {
      return send(message, 'Please provide a user to ban.');
    }

    const now = new Date(Date.now()).toLocaleString();

    try {
      // Log the ban action
      const modAction = new ModAction({
        userId: member.id,
        action: 'ban',
        reason,
        moderatorId: message.author.username
      });

      await modAction.save();

      const caseId = modAction._id.toString();

      // Ban the user
      await member.ban({ reason });

      const banMessage = `<:banned_KNL:1264938283541200949> *${member.user.tag}* was banned by *${message.author.tag}* with the Case Id *${caseId}* on *${now}* for: *${reason}*`;

      // Send a confirmation message to the channel
      await send(message, banMessage);

      // Attempt to send a DM to the banned user
      try {
        await member.send(banMessage);
      } catch (err) {
        console.error('Failed to send DM to banned user:', err);
      }

    } catch (error) {
      console.error('Error banning user:', error);
      return send(message, 'There was an error trying to ban the user.');
    }
  }
}

module.exports = {
  BanCommand
};
