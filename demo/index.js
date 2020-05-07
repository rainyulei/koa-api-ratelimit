/*
 * @Author: yu-lei
 * @Date: 2020-05-08 09:10:44
 * @Last Modified by: yu-lei
 * @Last Modified time: 2020-05-08 09:27:45
 */
/**
 * koa required
 */
const koa = require('koa');
const apiratelimit = require('../index');
const Redis = require('ioredis');
const koaRouter = require('koa-router');

/**
 * koa required entity
 */
const redis = new Redis();
const app = new koa();
const api = apiratelimit(redis);
const router = new koaRouter();
/**
 * router
 */
const homeLimit = api({
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
});
const userLimit = api({
  ip: ctx => {
    return ctx.ip;
  },
  url: ctx => {
    return ctx.path;
  },
  max: 20,
  duration: 6000,
  failed: (ctx, { delay, after }) => {
    console.log(delay, after);
    return (ctx.body = {
      code: 429,
      message: `delay ${delay}ms  after ${after}s can use`,
    });
  },
});
router.get('home', '/home', homeLimit, async ctx => {
  console.log('hello world');
  ctx.body = 'hello world  home api';
});

router.get('user', '/user', userLimit, async ctx => {
  console.log('hello world');
  ctx.body = 'hello world user api';
});

app.use(router.routes());
app.listen(3000, () => {
  console.log('success');
});
