// in-memory store by default (use the right module instead)
const session = require('koa-session');

// sid=asdkfjasdfkjasdfsdf
// const sessions = {
//   asdkfjasdfkjasdfsdf: {name: "Dmitry", count: 4}
// }

// ctx.sessions = {name: "Dmitry", count: 0}
exports.init = app => app.use(session({
  signed: false
}, app));
