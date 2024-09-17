const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const ModAction = require('../../lib/modAction'); // Replace with the actual model for mod actions
const { PermissionsBitField } = require('discord.js');

class RemoveUserModActionsCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      category: 'mod',
      permissions: [PermissionsBitField.Flags.ManageMessages],
      description: 'Remove all mod actions for a specified user by their user ID or mention',
    });
  }

  async messageRun(message, args) {
    // Permission check
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return send(message, ':warning: You are not authorized to use this command.');
    }

    // Get the user ID or mention
    const userInput = await args.pick('string').catch(() => null);
    if (!userInput) {
      return send(message, 'Please provide a valid user mention or ID.');
    }

    // Extract the user ID from the mention if necessary
    const userId = userInput.match(/^<@!?(\d+)>$/) ? userInput.match(/^<@!?(\d+)>$/)[1] : userInput;

    // Validate that the extracted user ID is a valid Discord ID (should be a numeric string)
    if (!/^\d+$/.test(userId)) {
      return send(message, 'Please provide a valid user mention or numeric ID.');
    }

    console.log(`Received user ID: ${userId}`); // Debugging log

    try {
      // Delete all mod actions for the user
      const result = await ModAction.deleteMany({ userId });

      if (result.deletedCount === 0) {
        console.log(`No mod actions found for user ID: ${userId}`); // Debugging log
        return send(message, `No mod actions found for user ID: ${userId}.`);
      }

      console.log(`Successfully removed all mod actions for user ID: ${userId}`); // Debugging log
      return send(message, `All mod actions for user ID ${userId} have been removed.`);
    } catch (error) {
      console.error('Error removing mod actions:', error);
      return send(message, 'An error occurred while trying to remove the mod actions.');
    }
  }
}

module.exports = {
  RemoveUserModActionsCommand,
};
