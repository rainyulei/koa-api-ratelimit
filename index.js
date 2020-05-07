'use strict';
/*
 * @Author: yu-lei
 * @Date: 2020-05-02 19:15:31
 * @Last Modified by: yu-lei
 * @Last Modified time: 2020-05-08 09:48:54
 * Limit the number of requests per IP per interface per unit time
 */
const assert = require('assert');
const apilimit = (() => {
  const timestep = Date.now() * 1e3;
  const appstart = process.hrtime();
  const mecrotime = function () {
    const diff = process.hrtime(appstart);
    return timestep + diff[0] * 1e6 + Math.round(diff[1] * 1e-3);
  };
  return db => {
    assert(db, 'db is required!');
    return apiconfig => {
      const duration = apiconfig.duration || 60000;
      const max = apiconfig.max || 50;
      const errorFun = apiconfig.failed || null;
      const ipfun = apiconfig.ip || null;
      const urlfun = apiconfig.url || null;
      return async (ctx, next) => {
        const ip = ipfun ? ipfun(ctx) : ctx.ip;
        const url = urlfun ? urlfun(ctx) : ctx.path;
        const key = ip + '_' + url;
        const now = mecrotime();
        const start = now - duration * 1000;
        const result = await new Promise((resolve, reject) => {
          db.multi([
            ['zremrangebyscore', key, 0, start],
            ['zcard', key],
            ['zadd', key, now, now],
            ['zrange', key, 0, 0],
            ['zrange', key, -max, -max],
            ['zremrangebyrank', key, 0, -(max + 1)],
            ['pexpire', key, duration],
          ]).exec(function (err, res) {
            if (err) return reject(err);
            const count = parseInt(Array.isArray(res[0]) ? res[1][1] : res[1]);
            const oldestTimer = parseInt(
              Array.isArray(res[0]) ? res[3][1] : res[3]
            );
            const oldestTimerBetween = parseInt(
              Array.isArray(res[0]) ? res[4][1] : res[4]
            );
            const microResetTime =
              (Number.isNaN(oldestTimerBetween)
                ? oldestTimer
                : oldestTimerBetween) +
              duration * 1000;
            const remaining = count < max ? max - count : 0;
            const reset = Math.floor(microResetTime / 1000000);
            if (remaining) {
              resolve({
                remaining,
              });
            }
            const delay = (reset * 1000 - Date.now()) | 0;
            const after = (reset - Date.now() / 1000) | 0;
            resolve({
              delay,
              after,
            });
          });
        });
        if (result.remaining) {
          return await next();
        } else if (result.delay) {
          if (errorFun) {
            errorFun(ctx, { delay: result.delay, after: result.after });
          } else {
            ctx.status = 429;
            ctx.body = `Rate limitd, retry in ${result.delay}`;
          }
        }
      };
    };
  };
})();
module.exports = apilimit;
