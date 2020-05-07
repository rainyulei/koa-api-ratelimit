const koa = require('koa');
const apiratelimit = require('../index');
const Redis = require('ioredis');
const redis = new Redis();
const app = new koa();
const api = apiratelimit(redis);
app.use(
  api({
    ip: ctx => {
      return ctx.ip;
    },
    url: ctx => {
      return ctx.path;
    },
    max: 1,
    duration: 6000,
    failed: (ctx, { delay, after }) => {
      console.log(delay, after);
      return (ctx.body = {
        code: 429,
        message: `delay ${delay} after ${after}`,
      });
    },
  })
);
app.use(async ctx => {
  if (ctx.path === '/home') {
    console.log('hahahah');
  }
});

app.listen(3000, () => {
  console.log('success');
});
