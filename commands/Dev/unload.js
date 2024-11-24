const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');

class UnloadCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'unload',
      description: 'Unload a command by its name.',
      preconditions: ['OwnerOnly'],  // You can set this to OwnerOnly or any custom permission system you use
      category: 'dev',
    });
  }

  async messageRun(message, args) {
    const commandName = await args.pick('string').catch(() => null);
    
    if (!commandName) {
      return send(message, 'Please provide a command name to unload.');
    }

    const command = this.container.stores.get('commands').get(commandName);

    if (!command) {
      return send(message, `The command \`${commandName}\` does not exist or is not loaded.`);
    }

    try {
      this.container.stores.get('commands').unload(command);
      return send(message, `Successfully unloaded the command \`${commandName}\`.`);
    } catch (error) {
      console.error(`Failed to unload command ${commandName}:`, error);
      return send(message, `Failed to unload the command \`${commandName}\`. Check the logs for more details.`);
    }
  }
}

module.exports = {
  UnloadCommand,
};
