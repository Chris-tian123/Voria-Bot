const { Listener } = require('@sapphire/framework');
const { EmbedBuilder } = require('discord.js');
const WelcomeConfig = require('../../lib/WelcomeConfig');

class GuildMemberAddListener extends Listener {
  constructor(context, options) {
    super(context, {
      ...options,
      event: 'guildMemberAdd',
    });
  }

  async run(member) {
    const config = await WelcomeConfig.findOne({ guildId: member.guild.id });
    if (!config) return; // No configuration found for this guild

    const welcomeChannel = member.guild.channels.cache.get(config.welcomeChannelId);
    if (!welcomeChannel) return; // Welcome channel not found

    const serverIcon = member.guild.iconURL();
    const welcomeMessage = config.welcomeMessage
      .replace('{user}', member.user.tag)
      .replace('{server}', member.guild.name);

    const embed = new EmbedBuilder()
      .setColor('#ffcc00')
      .setAuthor({ name: `Welcome, @${member.user.tag}`, iconURL: serverIcon })
      .setThumbnail(serverIcon)
      .setDescription(welcomeMessage)
      .setFooter({ text: `Today at ${new Date().toLocaleTimeString()}` });

    await welcomeChannel.send({ embeds: [embed] });
  }
}

module.exports = {
  GuildMemberAddListener,
};
