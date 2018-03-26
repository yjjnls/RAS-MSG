'use strict'
//Bank Service
const colors = require('colors');
const http = require('http');
const url = require('url');
let request = require('../lib/request.js');
// var redis = require("redis"),
//     client = redis.createClient();
let mq = require('../lib/mq.js');

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
let service_name = 'bank';
async function subscribe(topic) {
    await mq.subscribe(topic, service_name);
}

// http.createServer((req, res) => {
//     let chunk = [];

//     req.on('data', function (data) {
//         chunk.push(data);
//     });

//     req.on('end', function () {
//         let buf = Buffer.concat(chunk);
//         info(buf.toString());

//         OnMessage(buf, req, res);
//     })
// }).listen(8002);
// function OnMessage(data, req, res) {
//     if (req.headers) {
//         trace(JSON.stringify(req.headers));
//     }

//     let dataStr;

//     if (typeof data !== 'string') {
//         dataStr = data.toString();
//     } else {
//         dataStr = data;
//     }
//     let dataObj;//JSON format
//     try {
//         trace(dataStr);

//         dataObj = JSON.parse(dataStr);
//     }
//     catch (e) {
//         error('Invalid parameters! Can\'t parse!');
//         send(res, 400, 'Invalid parameters! Can\'t parse!');
//         return;
//     }

//     if (dataObj === undefined) {
//         error('Invalid parameters! Can\'t parse!');
//         send(res, 400, 'Invalid parameters! Can\'t parse!');
//         return;
//     }

//     let uri = url.parse(req.url, true);
//     if (uri.pathname == `/${service_name}`) {
//         // switch (req.method) {
//         //     case 'POST':
//         //         add_transcation(res, dataObj);
//         //         break;
//         //     case 'GET':
//         //         query(res, uri.query.id);
//         //         break;
//         // }
//         console.log('no process function!');
//     }
//     error('API Not found!');
//     send(res, 400, 'API Not found!');
// }

async function consume_msg() {
    let res = await mq.fetch_msg(service_name);
    console.log(`=====>fetch msg ${res.length} over<=====` + new Date());
    for (var i = 0; i < res.length; i = i + 2) {
        let msg_id = res[i + 1];
        try {
            let obj = JSON.parse(res[i]);
            let data = obj.data;
            let topic = obj.topic;
            console.log('-------------------');
            console.log(`[msg topic] ${topic}\n[msg id] ${msg_id} \n[msg data] ${data} \nDo Something!`);
            console.log('-------------------');

            await mq.update_recved_msg_id(service_name, topic, msg_id);
            // notify ras
            await request.Delete(`http://127.0.0.1:8000/msg?id=${msg_id}`);
        } catch (err) {
            console.log(err.message);
            throw new Error(err.message);
        }
    }
}
subscribe('money');
setInterval(async () => {
    await consume_msg();
}, 3000);