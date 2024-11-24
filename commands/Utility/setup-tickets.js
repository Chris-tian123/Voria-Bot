const { Command } = require('@sapphire/framework');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const TicketSetup = require('../../lib/TicketSetup.js'); // Import the model

class SetupTicketsCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'setup-tickets',
      description: 'Set up the ticket system by providing category ID, staff role ID, and ticket channel name.',
      category: 'utility',
    });
  }

  async messageRun(message) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.channel.send(':warning: You are not authorized to use this command.');
    }

    const guildId = message.guild.id;
    const setupData = {};

    const filter = (response) => response.author.id === message.author.id;

    // Ask for the staff role ID
    await message.channel.send('Please provide the **staff role ID** (you can copy the role ID in Discord Developer Mode):');
    const roleReply = await message.channel.awaitMessages({ filter, max: 1, time: 60000 });
    const staffRoleId = roleReply.first().content;

    // Validate the staff role ID
    const role = message.guild.roles.cache.get(staffRoleId);
    if (!role) {
      return message.channel.send('Invalid role ID. Setup canceled.');
    }
    setupData.staffRoleId = staffRoleId;

    // Ask for the category ID
    await message.channel.send('Please provide the **category ID** where tickets should be created (copy the category ID):');
    const categoryReply = await message.channel.awaitMessages({ filter, max: 1, time: 60000 });
    const categoryId = categoryReply.first().content;

    // Validate the category ID
    const category = message.guild.channels.cache.get(categoryId);
    if (!category || category.type !== 4) { // 4 = category type
      return message.channel.send('Invalid category ID. Setup canceled.');
    }
    setupData.categoryId = categoryId;

    // Ask for the ticket name template with "skip" option
    await message.channel.send('Please provide the **ticket name template** (e.g. `ticket-{user}`) or type `skip` to use the default format (`Ticket-{userID}`):');
    const ticketReply = await message.channel.awaitMessages({ filter, max: 1, time: 60000 });
    let ticketName = ticketReply.first().content;

    // If the user types "skip", default to "Ticket-{userID}"
    if (ticketName.toLowerCase() === 'skip') {
      ticketName = 'Ticket-{userID}';
    }

    setupData.ticketName = ticketName;

    // Create the log channel
    let logChannel;
    try {
      logChannel = await message.guild.channels.create({
        name: 'ticket-logs',
        type: 0, // Text channel
        permissionOverwrites: [
          {
            id: message.guild.id,
            deny: [PermissionsBitField.Flags.SendMessages],
          },
          {
            id: setupData.staffRoleId, // Give staff role access
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
        ],
      });
    } catch (error) {
      console.error('Error creating log channel:', error);
      return message.channel.send('Failed to create the log channel. Setup canceled.');
    }

    setupData.logChannelId = logChannel.id;

    // Save the setup data to MongoDB
    try {
      await TicketSetup.findOneAndUpdate(
        { guildId },
        {
          guildId,
          staffRoleId: setupData.staffRoleId,
          categoryId: setupData.categoryId,
          ticketName: setupData.ticketName,
          logChannelId: setupData.logChannelId,
        },
        { upsert: true, new: true }
      );
      message.channel.send('Ticket system successfully configured!');
    } catch (error) {
      console.error('Error saving to database: ', error);
      return message.channel.send('Failed to save the configuration. Please try again.');
    }

    // Create the ticket selection channel
    try {
      const ticketChannel = await message.guild.channels.create({
        name: 'ticket-selection',
        type: 0, // Text channel
        parent: setupData.categoryId,
        permissionOverwrites: [
          {
            id: message.guild.id,
            allow: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: setupData.staffRoleId, // Give staff role access
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
        ],
      });

      // Create an embed with the dropdown menu
      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('Support Ticket')
        .setDescription('Please select the type of issue you are experiencing from the dropdown below.');

      // Create the dropdown (select menu)
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('ticketTypeSelect')
        .setPlaceholder('Select an issue type...')
        .addOptions([
          {
            label: 'Technical Issue',
            value: 'technical_issue',
            description: 'Get help with a technical problem',
          },
          {
            label: 'Billing Issue',
            value: 'billing_issue',
            description: 'Get help with billing or payments',
          },
          {
            label: 'General Question',
            value: 'general_question',
            description: 'Ask a general question',
          },
        ]);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await ticketChannel.send({ embeds: [embed], components: [row] });

      message.channel.send(`Ticket selection channel created: ${ticketChannel}.`);
    } catch (error) {
      console.error('Error creating ticket channel:', error);
      message.channel.send('Failed to create the ticket channel.');
    }
  }
}

module.exports = {
  SetupTicketsCommand,
};
