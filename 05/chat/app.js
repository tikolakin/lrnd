const config = require('config');
const fs = require('fs');
const path = require('path');

const Koa = require('koa');

const app = new Koa();

const Router = require('koa-router');

const router = new Router();

const models = require('./models');

const handlers = fs.readdirSync(path.join(__dirname, 'handlers')).sort();
handlers.forEach((handler) => {
  const h = require(`./handlers/${handler}`);
  h.init(app);
});

app.context.models = models;

app.use(router.routes());

module.exports = app;
