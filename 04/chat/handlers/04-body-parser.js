const bodyParser = require('koa-bodyparser');
exports.init = app => app.use(bodyParser());
