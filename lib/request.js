'use strict'
let Promise = require('bluebird');
let request = require('request');

// promisify http request

function Request(method, uri, timeout = 3000, headers = undefined, json_data = undefined) {
    return new Promise(function (resolve, reject) {
        let options = {
            "method": method,
            "uri": uri,
            "timeout": timeout
        };
        if (headers != undefined)
            options.headers = headers;
        if (json_data != undefined)
            options.body = JSON.stringify(json_data);
        request(options)
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

async function post_msg(url, data, timeout = 3000) {
    let uuid;
    await Request('POST', url, timeout, data)
        .then(res => {
            uuid = JSON.parse(res).uuid;
            console.log(`post_msg successfully! message id: ${uuid}`);
        })
        .catch(err => {
            console.log(`post_msg error: [ ${err} ]`);
            throw new Error(err.toString());
        })
    return uuid;
}

async function put_msg(url, timeout = 3000) {
    await Request('PUT', url, timeout)
        .then(res => {
            console.log(`put_msg successfully!`);
        })
        .catch(err => {
            console.log(`put_msg error: [ ${err} ]`);
            throw new Error(err.toString());
        })

}

async function del_msg(url, timeout = 3000) {
    await Request('DELETE', url, timeout)
        .then(res => {
            console.log(`del_msg successfully!`);
        })
        .catch(err => {
            console.log(`del_msg error: [ ${err} ]`);
            throw new Error(err.toString());
        })

}

async function get_msg(url, timeout = 3000) {
    let res;
    await Request('GET', url, timeout)
        .then(res => {
            try {
                res = JSON.parse(res).msg;
            } catch (err) {
                throw new Error(err.toString());
            }
            console.log(`get_msg successfully! message id: ${uuid}`);
        })
        .catch(err => {
            console.log(`get_msg error: [ ${err} ]`);
            throw new Error(err.toString());
        })
    return res;
}

module.exports = {
    Post: post_msg,
    Put: put_msg,
    Delete: del_msg,
    Get: get_msg
}

// let uri = "http://127.0.0.1:8000/msg";

// async function test() {
//     try {
//         let uuid = await post_msg(uri, { "data": "123" });
//         console.log(uuid)
//         await put_msg(uri);
//     } catch (error) {
//         console.log('-----------------error----------------');
//         console.error(error.message);
//     }
// }

// test();