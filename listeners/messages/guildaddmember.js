// listeners/guildMemberAdd.js
const { Listener } = require('@sapphire/framework');
const ServerSettings = require('../../lib/ServerSetting.js'); // Adjust the path to your model

class GuildMemberAddListener extends Listener {
  constructor(context, options) {
    super(context, {
      ...options,
      event: 'guildMemberAdd',
    });
  }

  async run(member) {
    const guildId = member.guild.id;

    // Fetch server settings from the database
    const settings = await ServerSettings.findOne({ guildId });

    // If auto-ban for new accounts is not enabled, return early
    if (!settings || !settings.autoBanNewAccounts) return;

    // Check if the account is less than 24 hours old
    const accountAgeInMs = Date.now() - member.user.createdTimestamp;
    const oneDayInMs = 24 * 60 * 60 * 1000;

    if (accountAgeInMs < oneDayInMs) {
      // Attempt to ban the user
      try {
        await member.ban({ reason: 'Account is less than 1 day old.' });
        console.log(`Banned new account: ${member.user.tag}`);
      } catch (error) {
        console.error('Failed to ban new account:', error);
      }
    }
  }
}

module.exports = {
  GuildMemberAddListener,
};
