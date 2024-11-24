const { Command } = require('@sapphire/framework');
const { send } = require('@sapphire/plugin-editable-commands');
const { codeBlock, isThenable } = require('@sapphire/utilities');
const { inspect } = require('node:util');

class UserCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['e'],
            description: 'Evals any JavaScript code',
            quotes: [],
            category: 'dev',
            preconditions: ['OwnerOnly'],
            flags: ['async', 'hidden', 'showHidden', 'silent', 's'],
            options: ['depth']
        });
    }

    async messageRun(message, args) {
        const code = await args.rest('string');
        const { result, success, type } = await this.eval(code, {
            async: args.getFlags('async'),
            depth: Number(args.getOption('depth')) ?? 0,
            showHidden: args.getFlags('hidden', 'showHidden')
        });

        return this.handleResult(message, result, success, type, args.getFlags('silent', 's'));
    }

    async chatInputRun(interaction) {
        const code = interaction.options.getString('code');
        const asyncFlag = interaction.options.getBoolean('async') ?? false;
        const depth = interaction.options.getInteger('depth') ?? 0;
        const showHidden = interaction.options.getBoolean('hidden') ?? false;

        const { result, success, type } = await this.eval(code, {
            async: asyncFlag,
            depth: depth,
            showHidden: showHidden
        });

        return this.handleResult(interaction, result, success, type, false);
    }

    async eval(code, flags) {
        if (flags.async) code = `(async () => {\n${code}\n})();`;

        let success = true;
        let result = null;

        try {
            // eslint-disable-next-line no-eval
            result = eval(code); // Add variables in scope
const scopedEval = (message, client, guild) => eval(code);
result = scopedEval(message, this.container.client, message.guild);
            
        } catch (error) {
            if (error && error instanceof Error && error.stack) {
                this.container.client.logger.error(error);
            }
            result = error;
            success = false;
        }

        // Determine the type of the result
        let type = typeof result;
        if (Array.isArray(result)) type = 'array';

        if (isThenable(result)) result = await result;

        if (typeof result !== 'string') {
            result = inspect(result, {
                depth: flags.depth,
                showHidden: flags.showHidden
            });
        }

        return { result, success, type };
    }

    async handleResult(target, result, success, type, silent) {
        const output = success ? codeBlock('js', result) : `**ERROR**: ${codeBlock('bash', result)}`;
        if (silent) return;

        const typeFooter = `**Type**: ${type}`;

        if (output.length > 2000) {
            return send(target, {
                content: `Output was too long... sent the result as a file.\n\n${typeFooter}`,
                files: [{ attachment: Buffer.from(output), name: 'output.js' }]
            });
        }

        return send(target, `${output}\n${typeFooter}`);
    }
}

module.exports = {
    UserCommand
};
