const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const { PermissionsBitField } = require('discord.js');

class AntiLinkCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      aliases: ['al'],
      category: 'utility',
      description: 'Manage the anti-link automoderation rule.',
    });
  }

  async messageRun(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return send(message, ':Warning: You are not Authorized to use this command');
    }

    const subcommand = await args.pick('string').catch(() => null);
    if (!subcommand) {
      return send(message, 'Please provide a valid subcommand: activate, deactivate.');
    }

    switch (subcommand.toLowerCase()) {
      case 'activate':
        return this.activateAntiLink(message);
      case 'deactivate':
        return this.deactivateAntiLink(message);
      default:
        return send(message, 'Unknown subcommand. Valid subcommands are: activate, deactivate.');
    }
  }

  async activateAntiLink(message) {
    try {
      const rules = await message.guild.autoModerationRules.fetch();
      let rule = rules.find(r => r.name === 'Anti-Link');

      if (!rule) {
        rule = await message.guild.autoModerationRules.create({
          name: 'Anti-Link',
          creatorId: message.author.id,
          eventType: 1, // 1 corresponds to MESSAGE_SEND
          triggerType: 1, // 1 corresponds to KEYWORD
          triggerMetadata: {
            keywordFilter: ['*http://*', '*https://*'], // Matching URLs that start with http:// or https://
          },
          actions: [
            {
              type: 1, // 1 corresponds to BLOCK_MESSAGE
              metadata: {
                customMessage: 'Links are not allowed in this server.',
              },
            },
          ],
          enabled: true,
        });
      } else {
        await rule.edit({ enabled: true });
      }

      return send(message, 'Anti-link automoderation rule activated.');
    } catch (error) {
      console.error('Failed to activate automod rule:', error);
      return send(message, 'An error occurred while activating the anti-link automoderation rule.');
    }
  }

  async deactivateAntiLink(message) {
    try {
      const rules = await message.guild.autoModerationRules.fetch();
      const rule = rules.find(r => r.name === 'Anti-Link');

      if (rule) {
        await rule.edit({ enabled: false });
        return send(message, 'Anti-link automoderation rule deactivated.');
      } else {
        return send(message, 'No active anti-link automoderation rule found.');
      }
    } catch (error) {
      console.error('Failed to deactivate automod rule:', error);
      return send(message, 'An error occurred while deactivating the anti-link automoderation rule.');
    }
  }
}

module.exports = {
  AntiLinkCommand
};
