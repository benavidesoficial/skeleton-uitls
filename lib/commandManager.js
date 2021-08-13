class CommandManager {

    #COMMANDS = {};

    getCommands(){
        return Object.keys(this.#COMMANDS);
    }

    getCommand(commandName) {
        if (this.#COMMANDS.hasOwnProperty(commandName.toUpperCase())){
            return new this.#COMMANDS[commandName.toUpperCase()]()
        }
    }

    registerCommand(commandClass) {
        // console.log(commandClass)
        if(commandClass.COMMAND_NAME) {
            this.#COMMANDS[commandClass.COMMAND_NAME.toUpperCase()] = commandClass;
        } else {
            this.#COMMANDS[commandClass.prototype.constructor.name.toUpperCase()] = commandClass;
        }

    }

}

class BuildPDF {
    static COMMAND_NAME = 'htmlToPDF';
    execute(args){
        console.log('esta es mi accion, BUILDPFD:',args)
    }
}

class addPayment {
    static COMMAND_NAME = 'addPayment';
    execute(args, done){
        console.log('esta es mi accion, PAYMENT:',args)
    }
}

class addSubtracCredit {
    static COMMAND_NAME = 'addSubtracCredit';
    execute(args){
        console.log('esta es mi accion, CREDIT:',args)
    }
}


const manager = new CommandManager();
//
manager.registerCommand(BuildPDF);
manager.registerCommand(addPayment);
manager.registerCommand(addSubtracCredit);

console.log(manager.getCommands());

const command = manager.getCommand('pdf');

