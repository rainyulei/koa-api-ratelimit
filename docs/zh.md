# koa-api-ratelimit

用于接口限制请求速度的中间件。

可以根据不同的接口，接受不同的限速配置，灵活的限制单个接口的对应IP请求的速度。

## 使用

### Koa 中

   [demo](https://github.com/rainyulei/koa-api-ratelimit/blob/master/demo/index.js)

```javascript
/*
 * @Author: yu-lei
 * @Date: 2020-05-08 09:10:44
 * @Last Modified by: yu-lei
 * @Last Modified time: 2020-05-08 10:23:54
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
      message: `delay ${delay} ms after ${after} s can use`,
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

```

### eggjs 中使用

```javascript
//create middleware apilimitation   /middleware/apiLimitation.js

module.exports = require('koa-api-ratelimit');

//used in  /service/router.js

const apilimition = middleware.apiLimitation(app.redis);

router.get(
  '/weather',
// signal api rate limit  1times/1min per ip
  apilimition({ max: 1, duration: 60000 }),
  controller.user.weather
);
router.get(
  '/areacountries',
// signal api rate limit 6times/1min  per ip
  apilimition({ max: 6, duration: 60000 }),
  controller.user.getCountriesAndRigon
);
```




## 配置信息

### apiratelimit(db) 
db 是可操作的redis对象

### api（{apiconfig}）

`apiconfig ` 是对当前接口的限速配置
`apiconfig.duration` 计数的时间跨度 时间单位  毫秒 默认为 60000   ---1分钟
`apiconfig.max` max 单位时间跨度内最大访问次数  默认为50次
`apiconfig.ip:(ctx)=>{ return ctx.ip} `自定义IP标识的方法，不输入时默认为ctx.ip。使用该方法时需要返回一个返回值用于IP 标识。如果你不想要使用IP对访问者限制，而希望该接口访问者共享一个访问数字，你可以返回一个默认字符串，例如`return '_'`
`apiconfig.url:(ctx)=>{ return ctx.path} `需要返回一个可以识别当前接口的标识，默认为ctx.path

> 注意：不要携带参数 最好只区别url的name 或者 纯path来进行区别

`apiconfig.failed`:(ctx,{delay,after})=>{} 

请求超限后会执行的函数, 内部可以接收到ctx 和 {delay,after}两个参数, ctx koa的ctx 对象，delay 还有多长时间刷新-----毫秒值，after 还有多长时间刷新-----秒，如果没有设置则会默认发送429。