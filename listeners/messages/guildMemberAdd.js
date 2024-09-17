const { Listener } = require('@sapphire/framework');
const { EmbedBuilder } = require('discord.js');

class GuildMemberAddListener extends Listener {
  constructor(context, options) {
    super(context, {
      ...options,
      event: 'guildMemberAdd',
    });
  }

  async run(member) {
    const welcomeChannelId = '1228750407765852271'; // Replace with your welcome channel ID
    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);

    if (!welcomeChannel) return;

    const serverIcon = member.guild.iconURL();
    const embed = new EmbedBuilder()
      .setColor('#ffcc00')
      .setAuthor({ name: `Welcome, @${member.user.tag}`, iconURL: serverIcon })
      .setThumbnail(serverIcon)
      .setDescription(`REPLACE WITH YOUR SERVER WELCOME MESSAGE`)
      .setFooter({ text: `Today at ${new Date().toLocaleTimeString()}` });

    await welcomeChannel.send({ embeds: [embed] });
  }
}

module.exports = {
  GuildMemberAddListener,
};
