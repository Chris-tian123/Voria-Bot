const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const ModAction = require('../../lib/modAction'); // Replace with the actual model for mod actions
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

class HistoryCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      aliases: ['hi'],
      description: 'Show mod actions performed on the user',
    });
  }

  async messageRun(message, args) {
    const userId = await args.pick('string').catch(() => null);

    if (!userId) {
      return send(message, 'Please provide a user ID to view their mod history.');
    }
    const user = await message.client.users.fetch(userId);
    const action = await ModAction.find({ userId });

    if (action.length === 0) {
      return send(message, 'No mod actions found for the specified user.');
    }

      const embed = new EmbedBuilder()
      .setAuthor({ name: `Viewing mod actions for ${user.tag}`, iconURL: user.displayAvatarURL() })
      .setColor('#fc1c1c')
      .setTitle(`Mod Action History`)
      action.forEach(action => {
      embed.addFields({
        name: `> **${action.action}** | **${action._id}** \n > **Reason:** ${action.reason}\n > **Issued by:** ${action.moderatorId}`,
        value: ` `,
        inline: false,
      });
    });

    return send(message, { embeds: [embed] });
  }
}
module.exports = {
  HistoryCommand
};
