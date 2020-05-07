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
