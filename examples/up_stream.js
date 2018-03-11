'use strict'
let Promise = require('bluebird');
let request = require('request');

// push msg to RAS
async function prepare_msg(url, timeout = 3000) {
    await function () {
        return new Promise(function (resolve, reject) {
            request.post(url, { "timeout": timeout })
                .on('error', function (err) {
                    function (error, response, body) {
                        if (error)
                            if (error.code === 'ETIMEDOUT') {
                                let reason;
                                if (error.connect === true) {
                                    reason = `Connecting to ${uri} Timeout!`;
                                } else {
                                    reason = `Timeout: No response from ${uri}!`;
                                }
                                reject(reason);
                            }
                        if (response.statusCode != 200) {

                        } else {

                        }

                    })
        }
    }
}

async function local_processing() {

}

async function commit_msg() {

}