const { Command } = require('@sapphire/framework');
const { EmbedBuilder } = require('discord.js');

class PlayCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'play',
            description: 'Play a song from YouTube, Spotify, SoundCloud, or other sources.',
            category: 'music',
        });
    }

    async messageRun(message, args) {
        const query = await args.rest('string').catch(() => null);
        if (!query) {
            return message.channel.send('Please provide a song name or query.');
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.channel.send('You need to be in a voice channel to play music!');
        }

        try {
            // Attempt to play the song using the DisTube player
            await this.container.client.player.play(voiceChannel, query, {
                member: message.member,
                textChannel: message.channel,
                message,
            });
        } catch (error) {
            console.error('Error playing song:', error);
            return message.channel.send('An error occurred while trying to play the song.');
        }
    }
}

// Ensure the module.exports is correctly structured
module.exports = {
    PlayCommand,
};
