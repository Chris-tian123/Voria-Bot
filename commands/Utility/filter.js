const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const { PermissionsBitField } = require("discord.js")
const Blacklist = require('../../lib/bl');
const ModAction = require('../../lib/modAction');

class FilterCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      category: 'utility',  
      permissions: [PermissionsBitField.Flags.ManageGuild],
      description: 'Manage blacklisted words and filter messages'
    });
  }

  async messageRun(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return send(message, ':warning: You are not Authorized to use this command');
    }
    const action = await args.pick('string').catch(() => null);
    if (!action) {
      return send(message, 'Please provide a valid action: list, add, remove, check.');
    }

    switch (action.toLowerCase()) {
      case 'list':
        return this.listBlacklistedWords(message);
      case 'add':
        return this.addBlacklistedWord(message, args);
      case 'remove':
        return this.removeBlacklistedWord(message, args);
      case 'check':
        return this.checkBlacklistedWords(message);
      default:
        return send(message, 'Unknown action. Valid actions are: list, add, remove, check.');
    }
  }

  async listBlacklistedWords(message) {
    const words = await Blacklist.find();
    const wordList = words.map(doc => doc.word).join(', ') || 'No blacklisted words.';
    return send(message, `Blacklisted Words: ${wordList}`);
  }

  async addBlacklistedWord(message, args) {
    const word = await args.pick('string').catch(() => null);

    if (!word) return send(message, 'Please provide a word to add to the blacklist.');

    const exists = await Blacklist.findOne({ word });
    if (exists) return send(message, 'This word is already blacklisted.');

    const blacklistEntry = new Blacklist({ word });
    await blacklistEntry.save();

    return send(message, `Added "${word}" to the blacklist.`);
  }

  async removeBlacklistedWord(message, args) {
    const word = await args.pick('string').catch(() => null);

    if (!word) return send(message, 'Please provide a word to remove from the blacklist.');

    await Blacklist.deleteOne({ word });
    return send(message, `Removed "${word}" from the blacklist.`);
  }

  async checkBlacklistedWords(message) {
    const words = await Blacklist.find();
    return send(message, `Currently blacklisted words: ${words.map(w => w.word).join(', ')}`);
  }
}

module.exports = {
  FilterCommand
};
