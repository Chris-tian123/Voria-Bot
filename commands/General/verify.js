// commands/public/Verify.js
const { Command } = require('@sapphire/framework');
const VerificationRole = require('../../lib/VerificationRole');

class VerifyCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'verify',
      description: 'Verify yourself to receive a role in the server.',
      preconditions: ['DMOnly'], // Ensure the command is only used in DMs
    });
  }

  async messageRun(message, args) {
    // Ask for the server's ID
    await message.reply('Please enter the server ID you want to verify in:');
    const filter = response => response.author.id === message.author.id;
    const collected = await message.channel.awaitMessages({ filter, max: 1, time: 60000 });

    if (collected.size === 0) {
      return message.reply('You took too long to respond. Please try again.');
    }

    const serverId = collected.first().content.trim();
    const guild = this.container.client.guilds.cache.get(serverId);

    if (!guild) {
      return message.reply('Invalid server ID. Please make sure you are entering the correct ID of a server that this bot is in.');
    }

    const verificationRole = await VerificationRole.findOne({ guildId: guild.id });

    if (!verificationRole) {
      return message.reply('This server does not have a verification role set up.');
    }

    const member = await guild.members.fetch(message.author.id).catch(() => null);

    if (!member) {
      return message.reply('You must be a member of the server to be verified.');
    }

    try {
      await member.roles.add(verificationRole.roleId, 'Verified via bot command');
      return message.reply(`You have been verified in the server "${guild.name}" and the role has been assigned.`);
    } catch (error) {
      console.error('Error adding role to member:', error);
      return message.reply('There was an error adding the role. Please contact the server administrators.');
    }
  }
}

module.exports = {
  VerifyCommand,
};
