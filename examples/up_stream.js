'use strict'
//ZhiFuBao Service
const colors = require('colors');
const http = require('http');
const url = require('url');
let request = require('../lib/request.js');
var redis = require("redis"),
    client = redis.createClient();


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

/**---------------------------------------------------- */
http.createServer((req, res) => {
    let chunk = [];

    req.on('data', function (data) {
        chunk.push(data);
    });

    req.on('end', function () {
        let buf = Buffer.concat(chunk);
        info(buf.toString());

        OnMessage(buf, req, res);
    })
}).listen(8001);

let service_name = 'zhifubao';
function OnMessage(data, req, res) {
    if (req.headers) {
        trace(JSON.stringify(req.headers));
    }

    let dataStr;

    if (typeof data !== 'string') {
        dataStr = data.toString();
    } else {
        dataStr = data;
    }
    let dataObj;//JSON format
    try {
        trace(dataStr);

        dataObj = JSON.parse(dataStr);
    }
    catch (e) {
        error('Invalid parameters! Can\'t parse!');
        send(res, 400, 'Invalid parameters! Can\'t parse!');
        return;
    }

    if (dataObj === undefined) {
        error('Invalid parameters! Can\'t parse!');
        send(res, 400, 'Invalid parameters! Can\'t parse!');
        return;
    }

    let uri = url.parse(req.url, true);
    if (uri.pathname == `/${service_name}`) {
        switch (req.method) {
            case 'POST':
                add_transcation(res, dataObj);
                break;
            case 'GET':
                query(res, uri.query.id);
                break;
        }
    }
    error('API Not found!');
    send(res, 400, 'API Not found!');
}

let ras_url = 'http://127.0.0.1:8000/msg';
let local_url = 'http://127.0.0.1:8001/zhifubao';

async function add_transcation(res, data) {
    let step = 0;
    let msg_id;
    try {
        msg_id = await request.Post(`${ras_url}?topic=money`, { "data": data }, 3000, { "from": local_url });/**ras */
        step++;
        //local transcation
        console.log('do local transcation');
        step++;
        //store msg id( optimized: store in redis )
        await client.saddAsync(`msgs:${service_name}`, msg_id)
            .then(res => {
                console.log(`local transcation[${msg_id}] has been done in ${service_name} service!`);
            })
            .error(err => {
                console.log(err.message);
                throw new Error(err.message);
            })/**ras */
        step++;
        await request.Put(`${ras_url}?id=${msg_id}`);/**ras */
    }
    catch (err) {/**ras */
        switch (step) {
            case 0:
                break;
            case 1:
                console.log('transcation failed! roll back!');
                break;
            case 2:
                {
                    msgs.push(msg_id);
                    break;
                }
        }
    }
    send(res, 200, 'OK');
}

async function query(res, msg_id) {/**ras */
    await client.sismember(`msgs:${service_name}`, msg_id)
        .then(res => {
            if (res == 1)
                send(res, 200, JSON.stringify({ "msg": "done" }));
            else
                send(res, 200, JSON.stringify({ "msg": "undo" }));
        })
        .error(err => {
            console.log(err.message);
            throw new Error(err.message);
        })/**ras */
}