'use strict'
let Promise = require('bluebird');
let request = require('request');

// promisify http request

function Request(method, uri, timeout = 3000, json_data = undefined) {
    return new Promise(function (resolve, reject) {
        request(json_data == undefined ? {
            "method": method,
            "uri": uri,
            "timeout": timeout
        } : {
                "method": method,
                "uri": uri,
                "timeout": timeout,
                "body": JSON.stringify(json_data)
            })
            .on('error', function (error) {
                let reason = error.message;
                if (error.code === 'ESOCKETTIMEDOUT') {
                    reason = `Timeout: No response from ${uri}!`;
                }
                if (error.code === 'ECONNREFUSED') {
                    reason = `Connecting to ${uri} Timeout!`;
                }
                reject(reason);
            })
            .on('response', function (response) {
                response.on('data', function (data) {
                    if (response.statusCode == 200)
                        resolve(data.toString());
                    else
                        reject(data.toString());
                })
            })
    })
}

// operations of sending messages to service

async function push_msg(url, data, timeout = 3000) {
    let uuid;
    await Request('POST', url, timeout, data)
        .then(res => {
            uuid = JSON.parse(res).uuid;
            console.log(`push_msg successfully! message id: ${uuid}`);
        })
        .catch(err => {
            console.log(`push_msg error: [ ${err} ]`);
            throw new Error(err.toString());
        })
    return uuid;
}

async function publish_msg(url, timeout = 3000) {
    await Request('PUT', url, timeout)
        .then(res => {
            console.log(`publish_msg successfully!`);
        })
        .catch(err => {
            console.log(`publish_msg error: [ ${err} ]`);
            throw new Error(err.toString());
        })

}

async function consume_msg(url, timeout = 3000) {
    await Request('DELETE', url, timeout)
        .then(res => {
            console.log(`consume_msg successfully!`);
        })
        .catch(err => {
            console.log(`consume_msg error: [ ${err} ]`);
            throw new Error(err.toString());
        })

}

module.exports = {
    Prepare: push_msg,
    Commit: publish_msg,
    Complete: consume_msg
}

// let uri = "http://127.0.0.1:8000/msg";

// async function test() {
//     try {
//         let uuid = await push_msg(uri, { "data": "123" });
//         console.log(uuid)
//         await publish_msg(uri);
//     } catch (error) {
//         console.log('-----------------error----------------');
//         console.error(error.message);
//     }
// }

// test();