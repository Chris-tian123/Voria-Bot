const { Listener } = require('@sapphire/framework');
const AntiInviteSettings = require('../../lib/antiInviteModel.js'); // Adjust the path if necessary
const ModAction = require('../../lib/modAction.js'); // Adjust the path if necessary
const { PermissionsBitField } = require('discord.js');

class AntiDiscordInviteListener extends Listener {
  constructor(context, options) {
    super(context, {
      ...options,
      event: 'messageCreate',
    });
  }

  async run(message) {
    // Ignore bots and system messages
    if (message.author.bot) return;
  if (!message.guild) return;
    const guildId = message.guild.id;
    const userId = message.author.id;

    try {
      // Fetch the current settings for the guild
      const settings = await AntiInviteSettings.findOne({ guildId });

      // If the feature is disabled or the user has Manage Messages permission, do nothing
      if (!settings || !settings.enabled || message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        return;
      }

      // Check for Discord invite links
      const discordInvitePattern = /(?:https?:\/\/)?(?:www\.)?(?:discord\.gg|discordapp\.com\/invite)\/[A-Za-z0-9]+/i; // Case-insensitive flag added
      if (discordInvitePattern.test(message.content)) {
        // Increment user's warning count
        const userWarnings = await AntiInviteSettings.findOneAndUpdate(
          { guildId },
          { $inc: { warningCount: 1 } },
          { new: true }
        );

        const warningCount = userWarnings.warningCount;

        // If the user has 3 warnings, mute them
        if (warningCount >= 3) {
          const member = await message.guild.members.fetch(userId);
          await member.timeout(10 * 60 * 1000); // Mute for 1 hour (you can adjust the time)

          // Create a mod action record for the mute
          const modAction = new ModAction({
            action: 'Mute',
            userId: member.id,
            guildId: message.guild.id,
            moderatorId: message.author.id,
            reason: 'Muted for sending Discord invite links.',
            date: new Date(),
          });
          await modAction.save();

          // Inform the user about their mute
          try {
            await member.send(`You have been muted for sending Discord invite links. Please refrain from doing so.`);
          } catch (error) {
            console.error('Could not send DM to the user:', error);
          }

          // Delete the offending invite message
          await message.delete();

          return; // Exit after muting
        }

        // Send a warning message to the user in DMs
        try {
          await message.author.send(`This is warning ${warningCount} for sharing Discord invite links. You will be muted after 3 warnings.`);
        } catch (error) {
          console.error('Could not send DM to the user:', error);
        }

        // Delete the message with the invite link
        await message.delete();

        // Optionally, inform the server about the warning
      }
    } catch (error) {
      console.error('Error in AntiDiscordInviteListener:', error);
    }
  }
}

module.exports = {
  AntiDiscordInviteListener,
};
