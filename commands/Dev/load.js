const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const path = require('path');

class LoadCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'load',
      description: 'Load a command by its name.',
      category: 'dev',
      preconditions: ['OwnerOnly'], // Ensures only the bot owner can use this command
    });
  }

  async messageRun(message, args) {
    const commandName = await args.pick('string').catch(() => null);

    if (!commandName) {
      return send(message, 'Please provide the command name to load.');
    }

    const commandStore = this.container.stores.get('commands');
    const existingCommand = commandStore.get(commandName);

    if (!existingCommand) {
      return send(message, `Command \`${commandName}\` does not exist in the command store.`);
    }

    try {
      // Full path to the command file
      const commandPath = existingCommand.location.full;

      // Delete the cached command
      delete require.cache[require.resolve(commandPath)];

      // Reload the command
      const loadedCommand = require(commandPath);
      commandStore.load(commandPath, loadedCommand);

      return send(message, `Command \`${commandName}\` has been successfully loaded.`);
    } catch (error) {
      console.error(`Error loading command ${commandName}:`, error);
      return send(message, `Failed to load the command \`${commandName}\`. Check the logs for details.`);
    }
  }
}

module.exports = {
  LoadCommand,
};
