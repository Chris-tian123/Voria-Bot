const { Listener } = require('@sapphire/framework');
const { PermissionsBitField, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const TicketSetup = require('../lib/TicketSetup.js'); // Import the model
const fs = require('fs');
const path = require('path');

class InteractionCreateListener extends Listener {
  constructor(context, options) {
    super(context, {
      ...options,
      event: 'interactionCreate',
    });
    this.inactivityTimeouts = new Map(); // Track timeouts for channels
  }

  async run(interaction) {
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticketTypeSelect') {
      await this.handleTicketTypeSelect(interaction);
    } else if (interaction.isButton()) {
      await this.handleButtonClick(interaction);
    }
  }

  async handleTicketTypeSelect(interaction) {
    const { guild, user } = interaction;
    const ticketSetup = await TicketSetup.findOne({ guildId: guild.id });

    if (!ticketSetup) {
      return interaction.reply({ content: 'Ticket system is not set up properly. Please contact an admin.', ephemeral: true });
    }

    const ticketType = interaction.values[0]; // Get the selected option

    // Generate ticket channel name based on the template
    let ticketName = ticketSetup.ticketName.replace('{user}', user.username);
    ticketName = ticketName.replace('{userID}', user.id); // If userID is used in the template
    ticketName += `-${ticketType}`; // Append the ticket type to the name

    // Create the ticket channel
    try {
      const ticketChannel = await guild.channels.create({
        name: ticketName,
        type: 0, // Text channel
        parent: ticketSetup.categoryId,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
          {
            id: ticketSetup.staffRoleId,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
        ],
      });

      // Create an embed with the selected reason and action buttons
      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('New Support Ticket')
        .setDescription(`A new ticket has been created for ${user.username}`)
        .addFields(
          { name: 'Ticket Type:', value: `**${ticketType}**`, inline: false },
          { name: 'Created By:', value: `${user.username}`, inline: false }
        );

      // Create action buttons
      const buttonRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('lockTicket')
            .setLabel('Lock')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('claimTicket')
            .setLabel('Claim')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('closeTicket')
            .setLabel('Close')
            .setStyle(ButtonStyle.Danger)
        );

      await ticketChannel.send({ embeds: [embed], components: [buttonRow] });

      await interaction.reply({ content: `Ticket created: ${ticketChannel}.`, ephemeral: true });
    } catch (error) {
      console.error('Error creating ticket channel:', error);
      await interaction.reply({ content: 'Failed to create the ticket channel.', ephemeral: true });
    }
  }

  async createAndSendTranscript(ticketChannel, logChannel) {
    try {
      // Fetch the last 100 messages from the ticket channel
      const messages = await ticketChannel.messages.fetch({ limit: 100 });

      // Format the messages
      const transcript = messages
        .map(msg => `[${msg.author.tag}] ${msg.content}`)
        .reverse()
        .join('\n');

      // Define the file path
      const filePath = path.join(__dirname, '..', 'transcript.txt');

      // Write the transcript to the file
      fs.writeFileSync(filePath, transcript, 'utf8');

      // Send the file to the log channel
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle('Ticket Closed')
          .setDescription(`**Ticket Channel:** ${ticketChannel}\n**Closed By:** ${ticketChannel.guild.ownerId}`)
          .setTimestamp();

        await logChannel.send({ embeds: [logEmbed], files: [filePath] });
      } else {
        console.error('Log channel not found.');
      }
    } catch (error) {
      console.error('Error creating or sending transcript:', error);
    }
  }

  async handleButtonClick(interaction) {
    const { guild, customId, user, channel: ticketChannel } = interaction;
    const ticketSetup = await TicketSetup.findOne({ guildId: guild.id });

    if (!ticketSetup) {
      return interaction.reply({ content: 'Ticket system is not set up properly. Please contact an admin.', ephemeral: true });
    }

    const logChannelName = 'ticket-logs'; // Set to your desired log channel name
    const logChannel = guild.channels.cache.find(channel => channel.name === logChannelName);

    try {
      if (customId === 'lockTicket') {
        // Handle ticket locking
        await ticketChannel.permissionOverwrites.edit(ticketSetup.staffRoleId, {
          SendMessages: false,
        });
        await interaction.reply({ content: 'Ticket has been locked.', ephemeral: true });

      } else if (customId === 'claimTicket') {
        // Handle ticket claiming
        const claimEmbed = new EmbedBuilder()
          .setColor(0xFFFF00)
          .setTitle('Ticket Claimed')
          .setDescription(`${user.username} has claimed this ticket.`);
        await ticketChannel.send({ embeds: [claimEmbed] });
        await interaction.reply({ content: 'Ticket has been claimed.', ephemeral: true });

      } else if (customId === 'closeTicket') {
        // Handle ticket closing
        const ticketCreator = (await ticketChannel.messages.fetch({ limit: 1 })).first()?.author?.tag || 'Unknown User';

        if (logChannel) {
          try {
            await this.createAndSendTranscript(ticketChannel, logChannel); // Create and send transcript
          } catch (error) {
            console.error('Error creating or sending transcript:', error);
          }
        }

        try {
          await ticketChannel.delete(); // Delete the channel after sending the log message
        } catch (error) {
          console.error('Error deleting ticket channel:', error);
        }

        try {
          await interaction.reply({ content: 'Ticket has been closed.', ephemeral: true });
        } catch (error) {
          console.error('Error replying to interaction:', error);
        }
      }
    } catch (error) {
      console.error('Error handling button click:', error);
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ content: 'An error occurred while handling the interaction.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'An error occurred while handling the interaction.', ephemeral: true });
      }
    }
  }
}

module.exports = {
  InteractionCreateListener,
};
