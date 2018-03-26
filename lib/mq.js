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
        .then(res => {
            console.log(`store msg: ${JSON.stringify(data)} successfully!`);
        })
        .error(err => {
            console.log(err.message);
            throw new Error(err.message);
        })
}

async function del_msg(uuid) {
    client.zremrangebyscoreAsync('ras:msg', uuid, uuid)
        .then(res => {
            console.log(`delete msg[${uuid}] successfully!`);
        })
        .error(err => {
            console.log(err.message);
            throw new Error(err.message);
        })
}

async function get_msg(uuid) {
    let msg;
    await client.zrangebyscoreAsync('ras:msg', uuid, uuid)
        .then(res => {
            try {
                msg = JSON.parse(res);
            } catch (err) {
                return Promise.reject(new Error(err.message))
            }
            console.log(`get msg: ${res} by uuid:${uuid}.`);
        })
        .error(err => {
            console.log(err.message);
            throw new Error(err.message);
        })
    return msg;
}
/**mq */
async function subscribe(topic, service_name) {
    await client.zrankAsync(`sub:${topic}`, service_name)
        .then(res => {
            if (res == null)
                return client.zaddAsync(`sub:${topic}`, 0, service_name)
                    .then(res => {
                        console.log(`add ${service_name} to sub:${topic}.`);
                        return client.zaddAsync(`service:${service_name}`, 0, topic);
                    })
                    .then(res => {
                        console.log(`add ${topic} to service:${service_name}.`);
                    })
                    .error(err => {
                        console.log(err.message);
                        throw new Error(err.message);
                    })
            else
                console.log(`${service_name} already subscribed to sub:${topic}.`);
        })
        .error(err => {
            console.log(err.message);
            throw new Error(err.message);
        })
}
async function unsubscribe(topic, service_name) {
    await client.zremAsync(`sub:${topic}`, service_name)
        .then(res => {
            console.log(`remove ${service_name} from sub:${topic}.`);
            return client.zremAsync(`service:${service_name}`, topic);
        })
        .then(res => {
            console.log(`remove ${topic} from service:${service_name}.`);
        })
        .error(err => {
            console.log(err.message);
            throw new Error(err.message);
        })

}
async function publish(topic, uuid, json_data) {
    // get msg by uuid
    await client.zaddAsync(`topic:${topic}`, uuid, json_data)
        .then(res => {
            console.log(`publish msg[${uuid}] successfully!`);
        })
        .error(err => {
            console.log(err.message);
            throw new Error(err.message);
        })

}

async function fetch_msg(service_name) {
    let sub_info;
    let msgs = [];
    // fetch all unread msgs, could be optimized
    await client.zrangeAsync(`service:${service_name}`, 0, -1, 'withscores')
        .then(res => {
            sub_info = res;
        })
        .error(err => {
            console.log(err.message);
            throw new Error(err.message);
        })

    for (var i = 0; i < sub_info.length; i = i + 2) {
        let topic = sub_info[i];
        let max_recv = sub_info[i + 1];
        // console.log(`sub topic:${topic}, max received msg id:${max_recv}`);/*debug log*/
        // get one msg from every topic
        await client.zrangebyscoreAsync(`topic:${topic}`, max_recv, max_recv, 'withscores')
            .then(res => {
                msgs = msgs.concat(res);
            })
            .error(err => {
                console.log(err.message);
                throw new Error(err.message);
            })
    }
    return msgs;
}

async function update_recved_msg_id(service_name, topic, msg_id) {
    await client.zaddAsync(`sub:${topic}`, msg_id, service_name)
        .then(res => {
            return client.zaddAsync(`service:${service_name}`, msg_id, topic);
        })
        .then(res => {
            console.log(`service "${service_name}" received max msg id [${msg_id}] in topic "${topic}".`);
        })
        .error(err => {
            console.log(err.message);
            throw new Error(err.message);
        })
}

async function is_msg_consumed(topic, msg_id) {
    var is_consumed = false;
    await client.zrangeAsync(`sub:${topic}`, 0, 0, 'withscores')
        .then(res => {
            let max_recv = res[1];
            if (msg_id <= max_recv) {
                is_consumed = true;
            }
        })
        .error(err => {
            console.log(err.message);
            throw new Error(err.message);
        })
    return is_consumed;
}
async function unpublish(topic, uuid) {
    client.zremrangebyscoreAsync(`topic:${topic}`, uuid, uuid)
        .then(res => {
            console.log(`unpublish msg[${uuid}] successfully!`);
        })
        .error(err => {
            console.log(err.message);
            throw new Error(err.message);
        })
}

module.exports = {
    store_msg,
    del_msg,
    get_msg,
    subscribe,
    unsubscribe,
    publish,
    unpublish,
    fetch_msg,
    update_recved_msg_id,
    is_msg_consumed
}
// /**
//  * test
//  */
// let msg_id1 = 1,
//     msg_id2 = 2,
//     msg_id3 = 3,
//     msg_id4 = 4,
//     msg_id5 = 5;
// async function test() {
//     try {
//         // ras
//         await store_msg(msg_id1, "hello world 1", "http://xxx", "money", "2018.3.18");
//         await store_msg(msg_id2, "hello world 2", "http://xxx", "money", "2018.3.18");
//         await store_msg(msg_id3, "hello world 3", "http://xxx", "money", "2018.3.18");
//         await store_msg(msg_id4, "hello world 4", "http://xxx", "money", "2018.3.18");
//         await store_msg(msg_id5, "hello world 5", "http://xxx", "money", "2018.3.18");
//         console.log('=====>storg msg over<=====');
//         // ras
//         await publish(msg_id1);
//         await publish(msg_id2);
//         await publish(msg_id3);
//         await publish(msg_id4);
//         await publish(msg_id5);
//         console.log('=====>publish msg over<=====');

//         // downstream
//         await subscribe('money', 'taobao');
//         await subscribe('money2', 'taobao');
//         await unsubscribe('money2', 'taobao');
//         // downstream
//         let res = await fetch_msg('taobao');
//         console.log('=====>fetch msg over<=====');
//         for (var i = 0; i < res.length; i = i + 2) {
//             let msg_id = res[i + 1];
//             try {
//                 let obj = JSON.parse(res[i]);
//                 let data = obj.data;
//                 let topic = obj.topic;
//                 console.log(`[msg id] ${msg_id} [msg data] ${data} [msg topic] ${topic}  Do Something!`);

//                 await update_recved_msg_id('taobao', topic, msg_id);
//             } catch (err) {

//             }
//         }

//         // ras
//         if (await is_msg_consumed('money', msg_id1)) {
//             console.log(`msg[${msg_id1}] consumed!`);
//             await unpublish('money', msg_id1);
//             await del_msg(msg_id1);
//         }
//         if (await is_msg_consumed('money', msg_id2)) {
//             console.log(`msg[${msg_id2}] consumed!`);
//             await unpublish('money', msg_id2);
//             await del_msg(msg_id2);
//         }
//         if (await is_msg_consumed('money', msg_id3)) {
//             console.log(`msg[${msg_id3}] consumed!`);
//             await unpublish('money', msg_id3);
//             await del_msg(msg_id3);
//         }
//         if (await is_msg_consumed('money', msg_id4)) {
//             console.log(`msg[${msg_id4}] consumed!`);
//             await unpublish('money', msg_id4);
//             await del_msg(msg_id4);
//         }
//         if (await is_msg_consumed('money', msg_id5)) {
//             console.log(`msg[${msg_id5}] consumed!`);
//             await unpublish('money', msg_id5);
//             await del_msg(msg_id5);
//         }
//     } catch (error) {
//         console.log('-----------------error----------------');
//         console.error(error.message);
//     }
// }