// config/redis.js
const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDISCLOUD_URL,
  no_ready_check: true
});

redisClient.connect().catch(console.error);

module.exports = redisClient;
