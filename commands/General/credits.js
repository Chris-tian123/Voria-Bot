const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const { EmbedBuilder } = require('discord.js');

class CreditsCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			category: 'general',
      aliases: ['source'],
			description: 'Shows credits and information about the bot source'
		});
	}

	async messageRun(message) {
		// Create an embed with bot credit information
		const creditsEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle('Bot Credits')
			.setDescription('This bot was developed by the following contributors:')
			.addFields(
				{ name: 'Developer', value: 'Asteral' },
				{ name: 'Source Code', value: '[GitHub Repository](https://github.com/Asteral1/Voria-Bot)' },
				{ name: 'Special Thanks', value: 'Thanks to all supporters!' }
			)
			.setFooter({ text: 'Powered by Voria' })
			.setTimestamp();

		// Send the embed as a message reply
		return send(message, { embeds: [creditsEmbed] });
	}
}

module.exports = {
	CreditsCommand
};
