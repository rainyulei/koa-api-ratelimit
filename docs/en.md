# koa-api-ratelimit

Middleware used to limit the speed of interface requests.

Different speed limit configurations can be accepted according to different interfaces, flexibly limiting the speed of the corresponding IP request of a single interface.

## In used

### Koa 

   [demo]()

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

### Egg.js

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



## Configuration

### apiratelimit(db)

db is an object that can manipulate the redis database.

db is required.

### api（{apiconfig}）

`apiconfig ` Is a speed limit configuration for the current interface
`apiconfig.duration` The time range of the count, in milliseconds, defaults to 60,000 milliseconds -1 minute.
`apiconfig.max` The maximum number of accesses per unit time range ,default 50 times/duration.
`apiconfig.ip:(ctx)=>{ return ctx.ip}` Custom IP identification method, the default is ctx.ip when no input.When using this method, you need to return a return value for the IP identity。If you don't want to restrict visitors using IP, and you want the interface visitors to share an access number, you can return a default string, for example,  `return '_'`
`apiconfig.url:(ctx)=>{ return ctx.path}` You need to return an identity that recognizes the current interface, which defaults to ctx.path.

> Note: do not carry arguments. It is best to distinguish only the name or pure path of the url

`apiconfig.failed:(ctx,{delay,after})=>{} `

The function that will be executed after the request is exceeded can receive two parameters CTX and {delay,after} internally, CTX -- the CTX object of koa, delay  ---how long  to refresh -- millisecond , after -- how long to refresh -- seconds, if there is no setting, it will send 429 by default.