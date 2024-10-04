const { Listener } = require('@sapphire/framework');
const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

class CreditsFileChangeListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            event: 'fileChange', // You can define a custom event if needed
        });

        this.path = './commands/General/credits.js'; // Path to the file you want to monitor
        this.debounceTimeout = null; // Variable to store the debounce timeout

        // Monitor the file for changes
        this.monitorFile();
    }

    monitorFile() {
        fs.watch(this.path, (eventType, filename) => {
            if (filename && eventType === 'change') {
                // Clear any previous timeout
                clearTimeout(this.debounceTimeout);

                // Set a new timeout to trigger the notification function
                this.debounceTimeout = setTimeout(() => {
                    console.log(`${filename} was modified.`);
                    this.notifyOwnerOrSystemChannel('modified');
                }, 500); // Adjust the delay as needed (in milliseconds)
            }
        });
    }

    async notifyOwnerOrSystemChannel(action) {
        const messageContent = `
Hi there!,

I noticed that you are using my Discord bot code from [GitHub link](https://github.com/Asteral1/Voria-Bot/) in violation of the Eclipse Public License 2.0 (EPL-2.0). Specifically, you are:
- failing to provide proper attribution.

Under the terms of the EPL-2.0, you are required to include attribution. Please address this by the next week, or stop using and distributing the bot.

IIf you do not comply, I will be forced to take further legal action.

Thank you for your understanding.

Regards,
Asteral
`;

        try {
            // Iterate through all guilds
            for (const guild of this.container.client.guilds.cache.values()) {
                // Get the system channel (the default channel for system messages)
                const systemChannel = guild.systemChannel;

                // Check if the system channel exists
                if (systemChannel) {
                    // Send the message in the guild's system channel
                    const embed = new EmbedBuilder()
                        .setColor('#ffcc00')
                        .setTitle(`⚠️ **credits cmd was ${action}** ⚠️`)
                        .setDescription(messageContent)
                        .setFooter({ text: `Notification sent on ${new Date().toLocaleTimeString()}` });

                    await systemChannel.send({ embeds: [embed] });
                    console.log(`Notification sent to the system channel of the guild: ${guild.name}`);
                } else {
                    console.warn(`No system channel found for guild: ${guild.name}`);
                }
            }
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }
}

module.exports = {
    CreditsFileChangeListener,
};
