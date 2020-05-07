# koa-api-ratelimit

Koa and Egg.js middleware.
Redis is required!

## Install

```javascript
    npm i koa-api-ratelimit
```

## docs

[中文](https://github.com/rainyulei/koa-api-ratelimit/blob/master/docs/zh.md)
[EN](https://github.com/rainyulei/koa-api-ratelimit/blob/master/docs/en.md)

## used

```javascript
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
  max: 1,
  duration: 6000,
});

router.get('home', '/home', homeLimit, async ctx => {
  console.log('hello world');
  ctx.body = 'hello world  home api';
});
app.use(router.routes());
app.listen(3000, () => {
  console.log('success');
});
```

## demo

koa:[Demo](https://github.com/rainyulei/koa-api-ratelimit/blob/master/demo/index.js)
egg.js:[Demo](https://github.com/rainyulei/koa-api-ratelimit/blob/master/demo/eggjs.js)
