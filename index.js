const fs = require('fs');
const path = './commands/General/credits.js'; // Path to the file you want to check

// Check if the file exists
if (!fs.existsSync(path)) {
    console.error(`Error: ${path} is missing. The bot cannot start.`);
    process.exit(1); // Exit the process with a failure code
}

require('./lib/setup');
const { LogLevel, SapphireClient } = require('@sapphire/framework');
const { prefix, discord_token } = require('./config.json');
const { GatewayIntentBits, Partials, ActivityType, EmbedBuilder, PermissionsBitField, Collection } = require('discord.js');
const connectToDatabase = require('./lib/database');
const Blacklist = require('./lib/bl');
const ModActions = require('./lib/modAction');
const systeminformation = require('systeminformation');
const cron = require('node-cron');

const client = new SapphireClient({
	defaultPrefix: prefix,
	regexPrefix: /^(hey +)?bot[,! ]/i,
	caseInsensitiveCommands: true,
	logger: {
		level: LogLevel.Debug
	},
	shards: 'auto',
    intents: [
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
    ],
	partials: [Partials.Channel],
	loadMessageCommandListeners: true
});



client.on('messageCreate', async (message) => {
  // Ignore bot messages and messages not from guilds
  if (message.author.bot || !message.guild) return;

  const hasManageMessagesPermission = message.member.permissions.has(PermissionsBitField.Flags.ManageMessages);

  if (!hasManageMessagesPermission) {
    try {
      // Fetch blacklisted words from the database
      const blacklistedWords = await Blacklist.find().exec();
      const blacklistedWordsArray = blacklistedWords.map(word => word.word.toLowerCase());

      // Check if the message contains any blacklisted words
      const messageContent = message.content.toLowerCase();
      const containsBlacklistedWord = blacklistedWordsArray.some(word => messageContent.includes(word));

      if (containsBlacklistedWord) {
        // Delete the message
        await message.delete();

        // Warn the user
        await message.author.send(`<:warningcircle:1271507114975690873> [Auto] You were warned in ${message.guild.name} because your message contained a blacklisted word.`).catch(() => null);

        // Log the action
        const action = new ModActions({
          userId: message.author.id,
          action: 'Warn',
          reason: '[auto] Message contained a blacklisted word.',
          moderatorId: '1175540373205028924' // You might want to replace this with a proper moderator ID or a bot ID
        });
        await action.save();
      }
    } catch (error) {
      console.error('Error handling:', error);
    }
  }
});

connectToDatabase().then(() => {
const main = async () => {
	try {
		client.logger.info('Logging in');
		await client.login(discord_token);
		client.logger.info('logged in');
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
}
main();
});

        client.on('ready', (c) => {
        setInterval(() => {

            let status = [
              {
                name: 'customstatus',
                state: `👀 Monitoring Guilds`,
                type: ActivityType.Custom,
              },
            ];
            let random = Math.floor(Math.random() * status.length);
            client.user.setActivity(status[random]);

          }, `5000`);
    })

const MESSAGE_ID = '1265998109851517051';
const CHANNEL_ID = '1265988875592142900';

// Event handler for when the bot is ready
client.once('ready', () => {

    // Schedule task to run every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
        try {
            // Fetch system information
            const [cpu, memory, disk] = await Promise.all([
                systeminformation.cpu(),
                systeminformation.mem(),
                systeminformation.fsSize(),
            ]);

            // Prepare embed message
            const embed = new EmbedBuilder()
                .setTitle('Bot Stats')
                .setColor('#00FF00')
                .setTimestamp()
                .addFields(
                    { name: 'CPU', value: `${cpu.manufacturer} ${cpu.brand} @ ${cpu.speed} GHz`, inline: false },
                    { name: 'RAM Usage', value: `${Math.round(memory.active / (1024 * 1024))} MB / ${Math.round(memory.total / (1024 * 1024))} MB`, inline: false },
                    { name: 'Disk Space', value: `${Math.round(disk[0].used / (1024 * 1024 * 1024))} MB / ${Math.round(disk[0].size / (1024 * 1024 * 1024))} MB`, inline: false },
                )
                .setFooter({ text: `Last Updated` });

            // Fetch the channel and message
            const channel = await client.channels.fetch(CHANNEL_ID);
            if (channel && channel.isTextBased()) {
                try {
                    const message = await channel.messages.fetch(MESSAGE_ID);
                    await message.edit({ embeds: [embed] });
                } catch (messageFetchError) {
                    console.error('Failed to fetch or edit the message:', messageFetchError);
                }
            } else {
                console.error('Channel not found or is not a text-based channel.');
            }
        } catch (error) {
            console.error('Failed to fetch or send system information:', error);
        }
    });
});

