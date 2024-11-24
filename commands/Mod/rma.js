const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const ModAction = require('../../lib/modAction'); // Ensure this is the correct path to the mod action model
const { PermissionsBitField } = require('discord.js');
const mongoose = require('mongoose');

class RemoveModActionCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      category: 'mod',
      permissions: [PermissionsBitField.Flags.ManageMessages],
      description: 'Remove a mod action by case ID',
    });
  }

  async messageRun(message, args) {
    // Permission check
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return send(message, ':warning: You are not authorized to use this command.');
    }

    // Pick case ID argument
    const caseId = await args.pick('string').catch(() => null);
    if (!caseId) {
      return send(message, 'Please provide a case ID.');
    }

    try {
      // Determine if caseId is an ObjectId or a regular string
      let query = {};
      if (mongoose.Types.ObjectId.isValid(caseId)) {
        query = { _id: caseId }; // Use as an ObjectId if valid
      } else {
        query = { caseId }; // Otherwise, treat as a custom case ID
      }

      // Find and delete the mod action
      const result = await ModAction.findOneAndDelete(query);

      if (!result) {
        return send(message, `No mod action found with case ID: ${caseId}.`);
      }

      return send(message, `<:topgg_ico_delete:1264937656991612938> Mod action with case ID ${caseId} has been removed.`);
    } catch (error) {
      console.error('Error removing mod action:', error);
      return send(message, 'An error occurred while trying to remove the mod action.');
    }
  }
}

module.exports = {
  RemoveModActionCommand,
};
