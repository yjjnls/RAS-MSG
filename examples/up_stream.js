'use strict'
let Promise = require('bluebird');
let request = require('./request.js').Request;

// push msg to RAS
async function prepare_msg(url, timeout = 3000) {
    await request('POST', url, timeout)
        .then(res => {
            console.log(`prepare_msg ${res}`);
        })
        .catch(err => {
            console.log(`prepare_msg ${err}`);
            throw new Error(err.toString());
        })
}

async function local_processing() {

}

async function commit_msg(url, timeout = 3000) {
    await request('PUT', url, timeout)
        .then(res => {
            console.log(`commit_msg ${res}`);
        })
        .catch(err => {
            console.log(`commit_msg ${err}`);
            throw new Error(err.toString());
        })

}
let uri = "http://127.0.0.1:8000/msg";
let uri2 = "http://127.0.0.1:8080/msg";

async function test() {
    try {
        await prepare_msg(uri);
        await commit_msg(uri2);
    } catch (error) {
        console.log('-----------------error----------------');
        console.error(error.message);
    }
}

test();