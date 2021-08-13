import RouterBuild from './lib/RouterBuild.js';
import Router from './lib/Router.js';

new Router({
    managers: 'example/managers',
    middlewares: 'example/middlewares',
    // port: 7000,
    // host: '',
})
    .listen((err, message) => {
        console.log(`Servidor corriendo en  http://${message.host}:${message.port}`)
    })

// const test = new RouterMapper();
// console.log(test)
