'use strict'
var redis = require("redis"),
    client = redis.createClient();
var bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

function store_msg(uuid, msg_data, msg_from, msg_topic) {
    let data = {
        "data": msg_data,
        "from": msg_from,
        "topic": msg_topic
    };

    client.zaddAsync('ras:msg', uuid, JSON.stringify(data))
        .then((res) => {
            console.log(`store msg: ${res} successfully!`);
        })
        .error((err) => {
            console.log(err.message);
            throw new Error(err.message);
        })
}

function del_msg(uuid) {
    client.zremrangebyscore('ras:msg', uuid, uuid);
}

function subscribe(topic, service_name) {

}
function unsubscribe(topic, service_name) {

}
function publish_msg(uuid) {
    client.zrangebyscoreAsync('ras:msg', uuid, uuid)
        .then((res) => {
            console.log(`get msg: ${res} by uuid`);
            try {
                JSON.parse(res)

            } catch (err) {
                throw new Error(err.message);
            }

        })
        .error((err) => {
            console.log(err);
        })

}


let uuid = require('uuid');
let msg_id = Date.now();
console.log(typeof (msg_id))
store_msg(msg_id, "hello world", "http://xxx", "money", "2018.3.18");
// del_msg(msg_id);
publish_msg(msg_id);