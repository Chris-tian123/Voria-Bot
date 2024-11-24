const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const AutoResponder = require('../../lib/AutoResponder');
const { PermissionsBitField } = require('discord.js');

class AutoResponderCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      aliases: ['ar'],
      category: 'utility',
      description: 'Manage autoresponders for the server.',
    });
  }

  async messageRun(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return send(message, ':warning: You are not authorized to use this command.');
    }

    const subcommand = await args.pick('string').catch(() => null);
    if (!subcommand) {
      return send(message, 'Please provide a valid subcommand: add, remove, list.');
    }

    switch (subcommand.toLowerCase()) {
      case 'add':
        return this.addAutoResponder(message, args);
      case 'remove':
        return this.removeAutoResponder(message, args);
      case 'list':
        return this.listAutoResponders(message);
      default:
        return send(message, 'Unknown subcommand. Valid subcommands are: add, remove, list.');
    }
  }

  async addAutoResponder(message, args) {
    const trigger = await args.pick('string').catch(() => null);
    const response = await args.rest('string').catch(() => null);

    if (!trigger || !response) {
      return send(message, 'Usage: !autoresponder add <trigger> <response>');
    }

    await AutoResponder.create({
      guildId: message.guild.id,
      trigger: trigger.toLowerCase(),
      response,
    });

    return send(message, `Added autoresponder: **${trigger}** -> "${response}"`);
  }

  async removeAutoResponder(message, args) {
    const trigger = await args.pick('string').catch(() => null);

    if (!trigger) {
      return send(message, 'Usage: !autoresponder remove <trigger>');
    }

    const result = await AutoResponder.findOneAndDelete({
      guildId: message.guild.id,
      trigger: trigger.toLowerCase(),
    });

    if (!result) {
      return send(message, `No autoresponder found for trigger: **${trigger}**`);
    }

    return send(message, `Removed autoresponder for trigger: **${trigger}**`);
  }

  async listAutoResponders(message) {
    const responders = await AutoResponder.find({ guildId: message.guild.id });
    if (!responders.length) {
      return send(message, 'No autoresponders set up for this server.');
    }

    const list = responders.map((res) => `**${res.trigger}** -> "${res.response}"`).join('\n');
    return send(message, `Autoresponders:\n${list}`);
  }
}

module.exports = {
  AutoResponderCommand,
};
