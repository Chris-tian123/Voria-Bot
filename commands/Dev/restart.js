const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const axios = require('axios');
const { PermissionsBitField } = require('discord.js');

class RestartCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      description: 'Restart a Pterodactyl server',
      preconditions: ['OwnerOnly'],
      category: 'dev',
    });
  }

  async messageRun(message, args) {
    // Replace these with your actual Pterodactyl API key and server ID
    const API_KEY = 'ptlc_JzwGZHkuBYpBpgifSxse8aG7otKLJhqGYp2JXJSwCsj';
    const SERVER_ID = '4a0bfc23';
    const PTERODACTYL_API_URL = `https://hosting.roverdev.xyz/api/client/servers/${SERVER_ID}/power`;

    try {
      // Make the API request to restart the server
      const response = await axios.post(PTERODACTYL_API_URL, {
        signal: 'restart'
      }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        return send(message, 'Server restart initiated.');
      } else {
        return send(message, 'Failed to restart the server. Please check the server ID and try again.');
      }
    } catch (error) {
      console.error('Failed to restart server:', error);
      return send(message, 'An error occurred while attempting to restart the server.');
    }
  }
}

module.exports = {
  RestartCommand
};
