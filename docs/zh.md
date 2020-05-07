# koa-apiratelimit 

用于接口限制请求速度的中间件。可以根据不同的接口，就受不同的限制配置，灵活的限制单个接口的对应IP请求的速度。

## 使用

### koa 中

   

```javascript
const koa = require('koa');
const apiratelimit = require('../index');
const Redis = require('ioredis');
const redis = new Redis();
const app = new koa();

const api = apiratelimit(redis);
app.use(api({
  ip: ctx => {
    return ctx.ip;
  },
    url:ctx=>{
        return ctx.path
    }
  max: 1,
  duration: 6000,
  failed: (ctx, { delta, after }) => {
    console.log(delta, after);
     ctx.body = {
      code: 429,
       message: '延迟了'+delta+',等待'+after+''
    };
  },
}));
app.use(async ctx => {
   if (ctx.path === '/home') {
     console.log('hahahah');
    }
});

app.listen(3000, () => {
  console.log('success');
});


```



@params{duration 时间长度--秒，max 单位时间长度内最大请求次数} apiconfig {
  duration  时间跨度
 max  最大的访问量
  failed(ctx, { delta, after }) 失败后执行的方法  如果不传递则默认发送429 以及过期信息  接受  ctx 和  delta  时间以及 过多长时间可以继续访问
     ip(ctx) return 一个IP 地址 作为ip 参数  如果不传递则默认使用 ctx.ip
  url(ctx) 返回一个接口的标识  如果没有返回 则默认使用  ctx.path
     }
     