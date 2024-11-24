// commands/mod/toggleAutoBanNewAccounts.js
const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const ServerSettings = require('../../lib/ServerSetting.js'); // Adjust the path to your model
const { PermissionsBitField } = require('discord.js')

class ToggleAutoBanNewAccountsCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      description: 'Toggle the auto-ban for accounts created in the last 24 hours.',
      category: 'Utility',
    });
  }

  async messageRun(message) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return send(message, ':warning: You are not Authorized to use this command');
    }

    const guildId = message.guild.id;

    // Fetch the server settings from the database
    let settings = await ServerSettings.findOne({ guildId });

    if (!settings) {
      // If no settings are found, create a new record
      settings = new ServerSettings({ guildId });
    }

    // Toggle the auto-ban setting
    settings.autoBanNewAccounts = !settings.autoBanNewAccounts;
    await settings.save();

    const status = settings.autoBanNewAccounts ? 'enabled' : 'disabled';
    return send(message, `Auto-ban for new accounts has been **${status}**.`);
  }
}

module.exports = {
  ToggleAutoBanNewAccountsCommand,
};
