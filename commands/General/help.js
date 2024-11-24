const { Command } = require('@sapphire/framework');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { send } = require('@sapphire/plugin-editable-commands');

class HelpCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      category: 'general',
      aliases: ['h', 'cmds'],
      description: 'Displays a list of available commands based on your permissions.',
    });
  }

  async messageRun(message) {
    const { member, guild } = message;

    // Initialize command arrays
    const generalCommands = [];
    const modCommands = [];
    const utilityCommands = [];
    const devCommands = [];

    // Get all commands
    const commands = this.container.stores.get('commands');

    // Categorize commands based on metadata
    commands.forEach(command => {
      const category = command.options.category || 'general';  // Default to 'general'

      const commandDisplay = `\`${command.name}\``;
      const aliasDisplay = command.aliases.length ? ` [**${command.aliases.join(', ')}**]` : '';

      switch (category) {
        case 'general':
          generalCommands.push(commandDisplay + aliasDisplay);
          break;
        case 'mod':
          modCommands.push(commandDisplay + aliasDisplay);
          break;
        case 'utility':
          utilityCommands.push(commandDisplay + aliasDisplay);
          break;
        case 'dev':
          devCommands.push(commandDisplay + aliasDisplay);
          break;
      }
    });

    // Determine which embeds to send based on permissions
    if (member.permissions.has(PermissionsBitField.Flags.SendMessages)) {
      const generalEmbed = new EmbedBuilder()
        .setTitle('Help Menu')
        .setDescription('List of available general commands')
        .setColor('#00FF00')
        .setThumbnail(guild.iconURL())
        .addFields({ name: 'General Commands', value: generalCommands.join(', ') });

      await send(message, { embeds: [generalEmbed] });
    }

    if (member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
      const modEmbed = new EmbedBuilder()
        .setTitle('Help Menu')
        .setDescription('List of available mod commands')
        .setColor('#FF0000')
        .setThumbnail(guild.iconURL())
        .addFields({ name: 'Mod Commands', value: modCommands.join(', ') })
        .addFields({ name: 'General Commands', value: generalCommands.join(', ') });

      await send(message, { embeds: [modEmbed] });
    }

    if (member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      const utilityEmbed = new EmbedBuilder()
        .setTitle('Help Menu')
        .setDescription('List of available utility commands')
        .setColor('#0000FF')
        .setThumbnail(guild.iconURL())
        .addFields({ name: 'Utility Commands', value: utilityCommands.join(', ') })
        .addFields({ name: 'Mod Commands', value: modCommands.join(', ') })
        .addFields({ name: 'General Commands', value: generalCommands.join(', ') });

      await send(message, { embeds: [utilityEmbed] });
    }

    if (['870366927653056582', '843081146417020960', '1053012080812359750'].includes(message.author.id)) {
      const devEmbed = new EmbedBuilder()
        .setTitle('Help Menu')
        .setDescription('List of available dev commands')
        .setColor('#FFD700')
        .setThumbnail(guild.iconURL())
        .addFields({ name: 'Dev Commands', value: devCommands.join(', ') })
        .addFields({ name: 'Utility Commands', value: utilityCommands.join(', ') })
        .addFields({ name: 'Mod Commands', value: modCommands.join(', ') })
        .addFields({ name: 'General Commands', value: generalCommands.join(', ') });

      await send(message, { embeds: [devEmbed] });
    }
  }
}

module.exports = {
  HelpCommand,
};
