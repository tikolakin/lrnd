if (process.env.TRACE) {
  require('./libs/trace');
}

const Koa = require('koa');
const app = new Koa();

const config = require('config');

app.keys = [config.secret];

const path = require('path');
const fs = require('fs');

const handlers = fs.readdirSync(path.join(__dirname, 'handlers')).sort();

handlers.forEach(handler => require('./handlers/' + handler).init(app));

const Router = require('koa-router');

const router = new Router();

let clients = [];

router.get('/subscribe', async (ctx, next) => {

  ctx.set('Cache-Control', 'no-cache,must-revalidate');
  const message = await new Promise((resolve, reject) => {
    clients.push(resolve);

    ctx.res.on('close', function() {
      clients.splice(clients.indexOf(resolve), 1);
      resolve();
    });

  });

  ctx.body = message;

});

router.post('/publish', async (ctx, next) => {
  const message = ctx.request.body.message;

  if (!message) {
    ctx.throw(400);
  }

  clients.forEach(function(resolve) {
    resolve(String(message));
  });

  clients = [];

  ctx.body = 'ok';

});

app.use(router.routes());
if (module.parent) {
  module.exports = app;
} else {
  app.listen(3000);
}
