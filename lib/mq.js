'use strict'
var redis = require("redis"),
    client = redis.createClient();
var Promise = require('bluebird');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

async function store_msg(uuid, msg_data, msg_from, msg_topic) {
    let data = {
        "data": msg_data,
        "from": msg_from,
        "topic": msg_topic
    };

    await client.zaddAsync('ras:msg', uuid, JSON.stringify(data))
        .then((res) => {
            console.log(`store msg: ${JSON.stringify(data)} successfully!`);
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
async function publish_msg(uuid) {
    await client.zrangebyscoreAsync('ras:msg', uuid, uuid)
        .then((res) => {
            try {
                JSON.parse(res)
            } catch (err) {
                return Promise.reject(new Error(err.message))
            }
            console.log(`get msg: ${res} by uuid`);

        })
        .error((err) => {
            console.log(err);
        })

}


let uuid = require('uuid');
let msg_id = Date.now();
async function test() {
    try {
        await store_msg(msg_id, "hello world", "http://xxx", "money", "2018.3.18");
        console.log('--------1---------');
        let res = await publish_msg(msg_id);
        console.log('~~~~~~~~' + res)
    } catch (error) {
        console.log('-----------------error----------------');
        console.error(error.message);
    }
}

test();
// del_msg(msg_id);
