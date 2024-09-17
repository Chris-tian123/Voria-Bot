const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const FAQ = require('../../lib/faqModel');
const { EmbedBuilder } = require('discord.js');
const { PermissionsBitField } = require("discord.js");

class FAQCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      category: 'mod',
      permissions: [PermissionsBitField.Flags.ManageMessages],
      description: 'Edit or view the FAQs',
    });
  }

  async messageRun(message, args) {
          if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return send(message, ':warning: You are not Authorized to use this command');
    }
    const action = await args.pick('string').catch(() => null);

    if (!action) {
      return send(message, 'Please provide a valid action: list, view, add, edit, delete.');
    }

    switch (action.toLowerCase()) {
      case 'list':
        return this.listFAQs(message);
      case 'view':
        return this.viewFAQ(message, args);
      case 'add':
        return this.addFAQ(message, args);
      case 'edit':
        return this.editFAQ(message, args);
      case 'delete':
        return this.deleteFAQ(message, args);
      default:
        return send(message, 'Unknown action. Valid actions are: list, view, add, edit, delete.');
    }
  }

  async listFAQs(message) {
    const guildId = message.guild.id;
    const faqs = await FAQ.find({ guildId });

    if (!faqs.length) {
      return send(message, 'No FAQs found for this server.');
    }

    const embed = new EmbedBuilder()
      .setTitle('FAQs')
      .setColor('#fc1c1c');

    faqs.forEach(faq => {
      embed.addFields(
        { name: `Alias: ${faq.alias.join(', ')} - ID: ${faq._id}`, value: ` ` },
        { name: `Answer: ${faq.answer}`, value: ` ` }
      );
    });

    return send(message, { embeds: [embed] });
  }

  async viewFAQ(message, args) {
    const identifier = await args.pick('string').catch(() => null);
    if (!identifier) return send(message, 'Please provide an FAQ ID or alias.');

    const guildId = message.guild.id;
    let faq = await FAQ.findOne({ guildId, _id: identifier }).catch(() => null);
    if (!faq) {
      faq = await FAQ.findOne({ guildId, alias: identifier }).catch(() => null);
    }
    if (!faq) return send(message, 'FAQ not found.');

    const embed = new EmbedBuilder()
      .setTitle(`${faq.question}`)
      .setColor('#fc1c1c')
      .addFields(
        { name: `Answer: ${faq.answer}`, value: ` ` },
      );

    return send(message, { embeds: [embed] });
  }

  async addFAQ(message, args) {
    const guildId = message.guild.id;
    const alias = await args.pick('string').catch(() => null);
    const question = await args.pick('string').catch(() => null);
    const answer = await args.rest('string').catch(() => null);

    if (!alias || !question || !answer) {
      return send(message, 'Please provide an alias, a question, and an answer.');
    }

    const faq = new FAQ({ guildId, alias: alias.split(','), question, answer });
    await faq.save();

    return send(message, `FAQ added with ID: ${faq._id}`);
  }

  async editFAQ(message, args) {
    const guildId = message.guild.id;
    const id = await args.pick('string').catch(() => null);
    const newText = await args.rest('string').catch(() => null);

    if (!id || !newText) {
      return send(message, 'Please provide both an FAQ ID and the new text.');
    }

    const faq = await FAQ.findOne({ guildId, _id: id });
    if (!faq) return send(message, 'FAQ not found.');

    faq.answer = newText;
    await faq.save();

    return send(message, `FAQ with ID: ${faq._id} has been updated.`);
  }

  async deleteFAQ(message, args) {
    const guildId = message.guild.id;
    const id = await args.pick('string').catch(() => null);

    if (!id) {
      return send(message, 'Please provide an FAQ ID.');
    }

    const faq = await FAQ.findOne({ guildId, _id: id });
    if (!faq) return send(message, 'FAQ not found.');

    await FAQ.deleteOne({ guildId, _id: id });

    return send(message, `FAQ with ID: ${id} has been deleted.`);
  }
}

module.exports = {
  FAQCommand
};
