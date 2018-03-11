'use strict'
let Promise = require('bluebird');
let request = require('request');

function Request(method, uri, timeout = 3000) {
    return new Promise(function (resolve, reject) {
        request({
            "method": method,
            "uri": uri,
            "timeout": timeout
        })
            .on('error', function (error) {
                let reason = `Timeout: No response from ${uri}!`;
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

module.exports = {
    Request
}