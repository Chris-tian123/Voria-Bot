const { AllFlowsPrecondition } = require('@sapphire/framework');
const { container, Identifiers } = require('@sapphire/pieces');

class DMOnly extends AllFlowsPrecondition {
    messageRun(message) {
        return message.guild === null ? this.ok() : this.makeSharedError();
    }

    chatInputRun(interaction) {
        return interaction.guildId === null ? this.ok() : this.makeSharedError();
    }

    contextMenuRun(interaction) {
        return interaction.guildId === null ? this.ok() : this.makeSharedError();
    }

    makeSharedError() {
        return this.error({
            identifier: Identifiers.PreconditionDMOnly,
            message: 'You cannot run this command outside DMs.'
        });
    }
}

module.exports = { DMOnly };
