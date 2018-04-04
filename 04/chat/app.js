const config = require('config');
const fs = require('fs');
const path = require('path');

const Koa = require('koa');
const app = new Koa();

const Router = require('koa-router');
const router = new Router();

const handlers = fs.readdirSync(path.join(__dirname, 'handlers')).sort();
handlers.forEach((handler) => {
  const h = require(`./handlers/${handler}`);
  h.init(app);
});

app.context.subscribers = [];

router.get('/subscribe', async (ctx, next) => {
  ctx.set('Cache-Control', 'no-cache,must-revalidate');
  ctx.body = await new Promise((resolve) => {
    ctx.subscribers.push(resolve);

    ctx.req.on('close', () => {
      ctx.subscribers.splice(ctx.subscribers.indexOf(resolve, 1));
      resolve();
    });
  });

  await next();
});

router.post('/publish', async (ctx, next) => {
  const message = ctx.request.body.message;

  if (!message) {
    ctx.throw(400);
  }

  await ctx.subscribers.forEach((resolve) => {
    resolve(String(message));
  });
  ctx.subscribers = [];
  ctx.body = 'ok';
  await next();
});

app.use(router.routes());

module.exports = app;
