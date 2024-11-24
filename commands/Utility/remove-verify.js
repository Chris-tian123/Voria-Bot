const { Command } = require('@sapphire/framework');
const { PermissionsBitField } = require('discord.js');
const VerificationRole = require('../../lib/VerificationRole'); // Replace with the path to your model

class RemoveVerifyRoleCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            category: 'utility',
            aliases: ['rmvrc'],
            description: 'Remove the verify role assignment from the database.',
            permissions: [PermissionsBitField.Flags.ManageGuild],
            // Add any required preconditions here if necessary
        });
    }

    async messageRun(message) {
        // Check if the user has the required permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply('You do not have the required permissions to use this command.');
        }

        try {
            // Remove the verify role from the database for the guild
            const result = await VerificationRole.deleteOne({ guildId: message.guild.id });

            if (result.deletedCount === 0) {
                return message.reply('No verify role assignment found for this server.');
            }

            return message.reply('Verify role assignment has been removed from the database.');
        } catch (error) {
            console.error('Error removing verify role:', error);
            return message.reply('An error occurred while trying to remove the verify role.');
        }
    }
}

module.exports = {
    RemoveVerifyRoleCommand,
};