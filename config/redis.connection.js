const RedisClient = require('ioredis');



const redis = new RedisClient({
    host: 'redis-13646.c85.us-east-1-2.ec2.redns.redis-cloud.com',
    port: 13646,
    password: 'jPZxVOApWMR6fqXOtZOh3tcCVJjkJOd6',
    connectTimeout  : 30000
})



module.exports = redis;


