const { Command } = require('@sapphire/framework');
const { EmbedBuilder } = require('discord.js');

class ServerInfoCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'serverinfo',
            category: 'general',
            aliases: ['si'],
            description: 'Displays detailed information about the server.',
        });
    }

    async messageRun(message) {
        const { guild } = message;
        const { name, memberCount, channels, createdAt, premiumSubscriptionCount, roles } = guild;

        // Fetch the owner if it's not already available
        let owner;
        try {
            owner = await guild.fetchOwner();
        } catch (error) {
            owner = { user: { tag: 'Unknown', id: 'Unknown' } };
        }

        const textChannels = channels.cache.filter(ch => ch.type === 'GUILD_TEXT').size;
        const voiceChannels = channels.cache.filter(ch => ch.type === 'GUILD_VOICE').size;
        const totalBoosts = premiumSubscriptionCount || 0;
        const totalRoles = roles.cache.size - 1; // Exclude @everyone role

        const embed = new EmbedBuilder()
            .setTitle(`📊 Server Info: ${name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
            .setColor('#7289DA')
            .addFields(
                { name: '📝 Server Name', value: name, inline: false },
                { name: '👥 Total Members', value: `${memberCount}`, inline: false },
                { name: '👑 Owner', value: owner.user.tag, inline: false },
                { name: '📅 Created On', value: `<t:${Math.floor(createdAt.getTime() / 1000)}:D>`, inline: false },
                { name: '💎 Boost Level', value: `Level ${guild.premiumTier || 0} (${totalBoosts} boosts)`, inline: false },
                { name: '🔖 Roles', value: `${totalRoles}`, inline: false },
                { name: '🌍 Region', value: guild.preferredLocale || 'Automatic', inline: false }
            )
            .setFooter({ text: `Server ID: ${guild.id}` });

        return message.channel.send({ embeds: [embed] });
    }
}

module.exports = { ServerInfoCommand };
