exports.init = app => app.use(async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    if (e.status) {
      ctx.status = e.status;
      ctx.body = e.message;
    } else {
      ctx.status = 500;
      ctx.body = 'Internal server error';
      console.error(e.message, e.stack);
    }
  }
});
