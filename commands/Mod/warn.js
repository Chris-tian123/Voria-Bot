const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const ModAction = require('../../lib/modAction');
const { PermissionsBitField } = require("discord.js")

class WarnCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      category: 'mod',
      permissions: [PermissionsBitField.Flags.ManageMessages],
      description: 'Warn a user'
    });
  }

  async messageRun(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return send(message, ':warning: You are not Authorized to use this command');
    }
    const user = await args.pick('user').catch(() => null);
    const reason = await args.rest('string').catch(() => 'No reason provided');

    if (!user) {
      return send(message, 'Please provide a user to warn.');
    }

    const warndate = new Date(Date.now()).toLocaleString();

    const modAction = new ModAction({
      userId: user.id,
      action: 'Warn',
      reason,
      moderatorId: message.author.username
    });

    await modAction.save();

    const caseId = modAction._id.toString();

    const warnMessage = `:warning: *${user.tag}* was warned by *${message.author.tag}* with the Case Id *${caseId}* on *${warndate}* for: *${reason}*`;

    // Send the message to the channel
    await send(message, warnMessage);

    // Attempt to send the message to the user's DM
    try {
      await user.send(warnMessage);
          // Emit the custom warning event
    member.client.emit('userWarned', member, reason);
    } catch (err) {
      console.error('Failed to send DM to warned user:', err);
    }
  }
}

module.exports = {
  WarnCommand
};
