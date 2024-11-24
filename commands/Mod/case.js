const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const ModAction = require('../../lib/modAction'); // Replace with the actual model for mod actions
const { EmbedBuilder } = require('discord.js');
const { PermissionsBitField } = require("discord.js")
const mongoose = require('mongoose');

class CaseCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      category: 'mod',
      permissions: [PermissionsBitField.Flags.ManageMessages], 
      description: 'View details of a specific mod action case by its ID',
    });
  }

  async messageRun(message, args) {
      // Define the IDs or names of the staff roles
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManaeMessages)) {
      return send(message, ':warning: You are not Authorized to use this command');
    }

    const caseId = await args.pick('string').catch(() => null);

    if (!caseId) {
      return send(message, 'Please provide a case ID to view its details.');
    }

    // Validate the caseId format
    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return send(message, 'Invalid case ID format. Please provide a valid case ID.');
    }

    try {
      const modAction = await ModAction.findById(caseId);

      if (!modAction) {
        return send(message, 'No mod action found for the specified case ID.');
      }

      const user = await message.client.users.fetch(modAction.userId).catch(() => null);
      const moderator = await message.client.users.fetch(modAction.moderatorId).catch(() => null);

      const embed = new EmbedBuilder()
        .setTitle(`:warning: ${modAction.action.toUpperCase()} | ${modAction._id}`)
        .setColor('#fc1c1c')
        .addFields(
          { name: 'User', value: user ? `${user.tag} (${user.id})` : modAction.userId, inline: false },
          { name: 'Reason', value: modAction.reason, inline: false },
          { name: 'Issued by', value: moderator ? `${moderator.tag} (${moderator.id})` : modAction.moderatorId, inline: false },
          { name: 'Date', value: new Date(modAction.createdAt).toUTCString(), inline: false }
        );

      return send(message, { embeds: [embed] });
    } catch (error) {
      console.error('Error retrieving mod action:', error);
      return send(message, 'There was an error retrieving the mod action.');
    }
  }
}

module.exports = {
  CaseCommand
};
