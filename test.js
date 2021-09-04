import { CommandManager } from "./index.js";

class BuildPDF {
  static COMMAND_NAME = "htmlToPDF";
  execute(args) {
    console.log("esta es mi accion, BUILDPFD:", args);
  }
}

class addPayment {
  static COMMAND_NAME = "addPayment";
  execute(args, done) {
    console.log("esta es mi accion, PAYMENT:", args);
  }
}

class addSubtracCredit {
  static COMMAND_NAME = "addSubtracCredit";
  execute(args) {
    console.log("esta es mi accion, CREDIT:", args);
  }
}

const manager = CommandManager;
//
manager.registerCommand(BuildPDF);
manager.registerCommand(addPayment);
manager.registerCommand(addSubtracCredit);

console.log(manager.getCommands());

const command = manager.getCommand("pdf");
command.execute();
// const test = new RouterMapper();
// console.log(test)
