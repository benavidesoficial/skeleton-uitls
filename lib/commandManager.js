class CommandManager {
  #COMMANDS = {};

  getCommands() {
    return Object.keys(this.#COMMANDS);
  }

  getCommand(commandName) {
    if (this.#COMMANDS.hasOwnProperty(commandName.toUpperCase())) {
      return new this.#COMMANDS[commandName.toUpperCase()]();
    }
  }

  registerCommand(commandClass) {
    if (commandClass.COMMAND_NAME) {
      console.log(commandClass.COMMAND_NAME)
      this.#COMMANDS[commandClass.COMMAND_NAME.toUpperCase()] = commandClass;
    } else {
      this.#COMMANDS[commandClass.prototype.constructor.name.toUpperCase()] =
        commandClass;
    }
  }
}

export default new CommandManager();
