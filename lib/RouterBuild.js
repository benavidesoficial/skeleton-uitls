import express from 'express';
import {fdir} from "fdir";
import path from "path";
import {createRequire} from 'module';

/**
 *
 */

export default class RouterBuild {
    // Creamos el Storage donde se almacenara las rutas de cada Manager
    #storageRouter = [];
    #managersPATH;
    #middlewaresPATH;
    #middlewares;
    #middlewaresConfig;

    constructor({managers, middlewares}) {
        this.#managersPATH = managers;
        this.#middlewaresPATH = middlewares;

        // Importamos configuracion de middlewares
        const require = createRequire(import.meta.url);
        this.#middlewaresConfig = require(`${this.#middlewaresPATH}/middlewares.json`);
    }

    // Se encarga de localizar todos los Managers
    #pathManagers() {
        return new fdir()
            .withFullPaths()
            // .onlyDirs()
            // .withDirs()
            // .withMaxDepth(1)
            // .glob("./**/*.js")
            .filter((path, isDirectory) => {
                return path.endsWith('.js');
            })
            .exclude((dirName) => dirName.includes(".spec"))
            .crawl(this.#managersPATH)
            .sync();
    }

    #pathMiddlewares() {
        return new fdir()
            .withFullPaths()
            // .onlyDirs()
            // .withDirs()
            // .withMaxDepth(1)
            // .glob("./**/*.js")
            .filter((path, isDirectory) => {
                return path.endsWith('.js');
            })
            .exclude((dirName) => dirName.includes(".spec"))
            .crawl(this.#middlewaresPATH)
            .sync();
    }

    #imports(files, done) {
        let storageImports = [];
        let paths;
        switch (files) {
            case 'managers':
                // Obtenemos todos los Managers
                paths = this.#pathManagers();
                // Recorremos los directorios para importarlos y Agregamos las promesas en un Array
                paths
                    .forEach((managerPath) => storageImports.push(import(managerPath)));

                Promise.all(storageImports)
                    .then((imports) => {
                        done(null, this.#mapperManagers(imports, paths));
                    })
                    .catch((err) => {
                        done(err);
                    });

                break;
            case 'middlewares':
                // Obtenemos todos los Managers
                paths = this.#pathMiddlewares();
                // Creamos un array de promesas imports
                paths
                    .forEach((middlewaresPath) => storageImports.push(import(middlewaresPath)));

                Promise.all(storageImports)
                    .then((imports) => {
                        done(null, imports);
                    })
                    .catch((err) => {
                        done(err);
                    });

                break;
        }


    }

    buildRoutes(done = '') {
        /**
         * Para construit rutas, importaremos la Configuracion  de los Middlewares
         * tambien importaremos los Middlewares y por ultimo las rutas
         */

        // console.log(this.#storageMiddlewareImports)
        // Importamos los Middlewares
        this.#imports('middlewares', (err, middlewaresImported) => {
            if (err) done(err)
            // Mapeamos los middlewares
            this.#mapperMiddlewares(middlewaresImported);

            this.#imports('managers', (err, mapManagers) => {
                if (err) done(err);

                Object.keys(mapManagers).forEach((router) => {

                    // Aggregamos Middlewares
                    const Router = express.Router();
                    Router.use(this.#buildMiddlewares(router) || []);
                    mapManagers[router].forEach((manager) => {
                        // Valida que cada manejador tenga los elementos necesarios, de lo contrario lanza una exepcion
                        this.#isValidManager(manager, router);
                        // Construimos la ruta
                        Router[manager.method.toLowerCase()](`/${router}/${manager.url}`, this.#buildMiddlewares(router, manager) || [], manager.handler);
                    })
                    this.#storageRouter.push(Router);
                })

                done(null, this.#storageRouter);

            })
        })


        /**
         * Cargamos los Manejadores
         */

    }

    #mapperManagers(imports, path) {
        return imports
            .map((managerImported, i) => {
                // Obtenemos los Directorios
                const managerName = this.#getDirnameManager(path[i]);
                let mapManager = {};
                mapManager[managerName] = managerImported.default ? [new managerImported.default()] : undefined;
                // console.log(mapRoute)
                return mapManager
            })
            // Eliminando Undefined
            .filter((ev) => ev[Object.keys(ev)[0]])
            // // Reduciendo Array
            .reduce((acc, current) => {
                Object.entries(current).forEach(([k, v]) => (acc[k] = acc[k] || []).push(...v));
                return acc;
            }, {})
    }

    #mapperMiddlewares(middlewaresImported) {
        // Mapeamos todos los middlewares para crearles un atributo y despues reducimos un objecto, asi logramos
        // tener una Objecto de Middlewares
        this.#middlewares = middlewaresImported
            .map((middleware) => {
                if (middleware.default) {
                    let x = {}
                    x[middleware.default.name.toLowerCase()] = new middleware.default();
                    if (x[middleware.default.name.toLowerCase()].handler)
                        return x
                    else
                        return undefined;
                }
                return undefined
            })
            // Eliminando los undefined
            .filter((ev) => ev)
            .reduce((acc, current) => {
                acc[Object.keys(current)[0]] = current[Object.keys(current)];
                return acc;
            }, {});
    }

    #buildMiddlewares(route, manager = false) {
        let middlewares = [];
        let instanceName;
        if (!manager && this.#middlewaresConfig.hasOwnProperty('*')) {
            middlewares.push(...this.#middlewaresConfig['*'])
        }
        else {
            instanceName = manager.constructor.name.toLowerCase();
        }
        if (this.#middlewaresConfig[route]  && this.#middlewaresConfig[route][instanceName || '*']) middlewares.push(...this.#middlewaresConfig[route][instanceName || '*']);
        // if (this.#middlewaresConfig[route]) middlewaresAll.push(...this.#middlewaresConfig[route][instanceName]);
        return middlewares
            .map(middlewareString => this.#middlewares[middlewareString])
            .filter(ev => ev)
            .map(middlewareString => middlewareString.handler());
    }

    // Obtiene la base del Directorio donde se encuentra un Manager
    #getDirnameManager(manager) {
        return path.basename(path.dirname(manager)).toLowerCase();
    }


    #isValidManager(manager, router) {
        if (!manager.method.length || !manager.handler) {
            try {
                throw new Error(`Falta un argumento o se encuentra mal escrito en el el Manager ${router.toUpperCase()} clase ${manager.constructor.name.toUpperCase()} 
                                - method: ${manager.method}
                                - url: ${manager.url}
                                - handler: ${manager.handler}
                                `);
            } catch (e) {
                console.error(e);
                process.exit(1)
            }
        }
    }

    // Elimina valores repetidos en un Array
    // #uniqArray(a) {
    //     return Array.from(new Set(a));
    // }
    // #isObjet(item) {
    //     return (typeof item === "object" && !Array.isArray(item) && item !== null)
    // }

}


