const config = require('config');

const Koa = require('koa');
const app = new Koa();

const Router = require('koa-router');
const router = new Router();


router.get('/', async (ctx, next) => {
  ctx.body = { hello: 'World!' };
});

app.use(router.routes());

const server = app.listen(config.get('port')).on('error', err => console.error(err));

module.exports = server;
