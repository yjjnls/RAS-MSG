'use strict'
var redis = require("redis"),
    client = redis.createClient();
var bluebird = require('bluebird');

client.on("error", function (err) {
    console.log("Error " + err);
});

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

function store_msg(uuid, msg_data, msg_from, msg_topic, msg_created_time) {
    let data = {
        "data": msg_data,
        "from": msg_from,
        "topic": msg_topic,
        "time": msg_created_time
    };
}