const { Command } = require('@sapphire/framework');
const { PermissionsBitField } = require('discord.js');
const TicketSetup = require('../../lib/TicketSetup.js'); // Import the model

class RemoveTicketsCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'remove-tickets',
      description: 'Remove the ticket system setup and delete the ticket selection channel.',
      category: 'utility',
      aliases: ['rmvtick'],
    });
  }

  async messageRun(message) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return send(message, ':warning: You are not Authorized to use this command');
      }
    const guildId = message.guild.id;

    // Fetch the ticket system setup data
    const ticketSetup = await TicketSetup.findOne({ guildId });
    if (!ticketSetup) {
      return message.channel.send('Ticket system is not set up for this guild.');
    }

    try {
      // Delete the ticket selection channel
      const ticketChannel = message.guild.channels.cache.find(c => c.name === 'ticket-selection');
      if (ticketChannel) {
        await ticketChannel.delete();
      }

      // Remove the ticket system setup data from the database
      await TicketSetup.deleteOne({ guildId });
      await message.author.send('The ticket system was removed with success!')
    } catch (error) {
      console.error('Error removing ticket system:', error);
      message.channel.send('Failed to remove the ticket system. Please try again later.');
    }
  }
}

module.exports = {
  RemoveTicketsCommand,
};
