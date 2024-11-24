const { Command } = require('@sapphire/framework');
const AntiInviteSettings = require('../../lib/antiInviteModel.js'); // Import the model for toggle status
const { PermissionsBitField } = require('discord.js');
const { send } = require('@sapphire/plugin-editable-commands');

class ToggleAntiInviteCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'anti-invite',
      description: 'Toggle the anti-Discord invite link feature on or off.',
      category: 'utility',
    });
  }

  async messageRun(message) {
    // Check if the user has Manage Messages permission
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return send(message, ':warning: You are not authorized to use this command.');
    }

    const guildId = message.guild.id;
	const userId = message.author.id;
    try {
      // Check if there's already a record for this guild
      let settings = await AntiInviteSettings.findOne({ guildId });

      if (!settings) {
        // If no settings exist for the guild, create a new record
        settings = new AntiInviteSettings({ 
          userId,
          guildId, 
          enabled: true, // Set enabled to true by default
          warningCount: 0, // Initialize warningCount
        });
      } else {
        // Toggle the `enabled` status
        settings.enabled = !settings.enabled;
      }

      await settings.save();

      const status = settings.enabled ? 'enabled' : 'disabled';
      return send(message, `Anti-Discord invite feature has been ${status} in this server.`);
    } catch (error) {
      console.error('Failed to toggle the anti-invite setting:', error);
      return send(message, 'An error occurred while trying to update the settings.');
    }
  }
}

module.exports = {
  ToggleAntiInviteCommand,
};
