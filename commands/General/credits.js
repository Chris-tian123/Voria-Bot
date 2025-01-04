const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');

class UserCommand extends Command {
	constructor(context, options) {
		super(context, {
			...options,
			category: 'general',
			description: 'Displays credits for the bot'
		});
	}

	async messageRun(message) {
		const content = `
**Bot Credits**
- **Developer**: Asteral / christiannn_122
- **Library**: discord.js ([Visit Website](https://discord.js.org)), Sapphire ([Visit Website](https://www.sapphirejs.dev/))
- **Link**: https://github.com/Chris-tian123/Voria-Bot

Thank you for using this bot! 💖
		`;

		return send(message, content);
	}
}

module.exports = {
	UserCommand
};
