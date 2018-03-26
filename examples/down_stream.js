'use strict'
//Bank Service
const colors = require('colors');
const http = require('http');
const url = require('url');
let request = require('../lib/request.js');


const CRLF = '\r\n';
function trace(arg) {
    console.log(arg.gray + '\n');
}

function error(arg) {
    console.log(arg.red + '\n');
}

function info(arg) {
    console.log(arg.green + '\n');
}
function send(res, status_code, content) {
    if (res == null || res == undefined)
        return;
    res.writeHead(status_code, {
        "Content-Type": "application/octet-stream",
        "Connection": "Keep-Alive"
    });
    res.write(content);
    res.end();

    info(content);
}

/**----------------------------------------------------- */
