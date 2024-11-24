const { ApplicationCommandRegistry, Command } = require('@sapphire/framework');

class PingCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			description: 'ping pong'
		});
	}

	async chatInputRun(interaction) {
		// Responding with "Ping?"
		await interaction.reply({ content: 'Ping?', fetchReply: true }).then((message) => {
			// Calculating latencies
			const botLatency = Math.round(this.container.client.ws.ping);
			const apiLatency = message.createdTimestamp - interaction.createdTimestamp;

			// Editing the response with the latencies
			interaction.editReply(`:clock: Pong! Bot Latency ${botLatency}ms. API Latency ${apiLatency}ms.`);
		});
	}

	registerApplicationCommands(registry) {
		registry.registerChatInputCommand(
			{
				name: 'ping',
				description: 'ping pong'
			},
    );
	}
}

module.exports = {
	PingCommand
};
