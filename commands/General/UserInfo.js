const { Command } = require('@sapphire/framework');
const { EmbedBuilder } = require('discord.js');

class UserInfoCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'userinfo',
            aliases: ['ui'],
            category: 'general',
            description: 'Displays detailed information about a user.'
        });
    }

    async messageRun(message) {
        const user = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(user.id);

        // Ensure member data is available
        if (!member) {
            return message.channel.send('User not found in this guild.');
        }

        // Get roles excluding the @everyone role
        const roles = member.roles.cache
            .filter(role => role.name !== '@everyone')
            .map(role => role.name)
            .join(', ') || 'No roles';

        // Create the embed with additional styling
        const embed = new EmbedBuilder()
            .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setColor('#3498db')
            .addFields([
                { name: '🆔 User ID', value: user.id, inline: false },
                { name: '👤 Username', value: `${user.username}`, inline: false },
                { name: '📆 Account Created', value: user.createdAt.toDateString(), inline: false },
                { name: '🗓️ Joined Server', value: member.joinedAt ? member.joinedAt.toDateString() : 'Unknown', inline: false },
                { name: '🌟 Roles', value: roles, inline: false }
            ])
            .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        // Send the embed
        return message.channel.send({ embeds: [embed] });
    }
}

module.exports = { UserInfoCommand };
