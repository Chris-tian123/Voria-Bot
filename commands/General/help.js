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

    const generalCommands = [];
    const modCommands = [];
    const utilityCommands = [];
    const devCommands = [];

    const commands = this.container.stores.get('commands');

    commands.forEach(command => {
      const category = command.options.category || 'general'; // Default to 'general'

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

    if (await this.container.client.preconditions.run(message, this, ['OnlyOwner']).success) {
      const devEmbed = new EmbedBuilder()
        .setTitle('Help Menu')
        .setDescription('List of available developer commands')
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
