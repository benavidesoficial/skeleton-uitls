import express from 'express';
import fs from 'fs';
import RouterBuild from "./RouterBuild.js";

export default class Router {

  #app = express()
  #port;
  #host;
  #managers;
  #middlewares;

  constructor({managers, middlewares, port, host} = {}) {

    this.#managers = `${process.cwd()}/${managers || ''}`;
    this.#middlewares = `${process.cwd()}/${middlewares || ''}`
    this.#port = port || 3000;
    this.#host = host || 'localhost';

    this.#run();
  }

  #run() {
    this.#isExistManager();
    this.#isExistMiddlewares();
    this.#isExistMiddlwareConfig();
  }

  // Verifica si existe el directorio Managers
  #isExistManager() {
    if (!this.#managers) {
      try {
        throw new Error(`No ha definido la propiedad 'managers' en el constructor`);
      } catch (e) {
        console.error(e);
        process.exit(1)
      }
    } else if (!fs.existsSync(this.#managers)) {
      try {
        throw new Error(`No existe el directorio ${this.#managers}`);
      } catch (e) {
        console.error(e);
        process.exit(1);
      }
    }
  }

  // Verifica si existe el directorio Middlewares
  #isExistMiddlewares() {
    if (!this.#middlewares) {
      try {
        throw new Error(`No ha definido la propiedad 'middlewares' en el constructor`);
      } catch (e) {
        console.error(e);
        process.exit(1)
      }
    } else if (!fs.existsSync(this.#middlewares)) {
      try {
        throw new Error(`No existe el directorio ${this.#middlewares}`);
      } catch (e) {
        console.error(e);
        process.exit(1)
      }
    }

  }

  #isExistMiddlwareConfig(){
    if (!fs.existsSync(`${this.#middlewares}/middlewares.json`)) {
      try {
        throw new Error(`No existe ${this.#middlewares}/middlewares.json`);
      } catch (e) {
        console.error(e);
        process.exit(1)
      }
    }
  }

  // #findFileConfig(){
  //   const require = createRequire(import.meta.url);
  //
  //   // const dir = new fdir()
  //   //     .withFullPath s()
  //   //     // .onlyDirs()
  //   //     // .withDirs()
  //   //     .withMaxDepth(1)
  //   //     // .glob("./**/*.js")
  //   //     .filter((path) => path.endsWith("skeleton.json"))
  //   //     .crawl(this.#skeleton)
  //   //     .sync()[0];
  //
  //   return require(this.#managers);
  // }


  // preMiddlewares() {
  // this.app.use(cors());
  // this.app.use(bodyParser.json());
  // this.app.use(bodyParser.urlencoded({
  //   extended: true
  // }));
  // this.app.use(passport.initialize());
  // }

  // _loadStrategies() {
  //   let strategies = this._getPassportStrategies();
  //   strategies.forEach(strategy => {
  //     let Strategy = require(`${strategy}`);
  //     passport.use(Strategy);
  //   })
  // }

  listen(done) {
    this.#compileRouter((err) => {
      this.#app.listen(this.#port, this.#host);
      console.log();
      done(null, {port: this.#port, host: this.#host});
      console.log();

    })
  }

  #compileRouter(done) {
    const Routes = new RouterBuild({
      managers: this.#managers,
      middlewares: this.#middlewares
    })

    Routes.buildRoutes((err, routes) => {
      this.#app.use(routes);
      done(null);
    });
  }

}
