require("dotenv").config();
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null }); // mặc định localhost:6379
module.exports = redis;
