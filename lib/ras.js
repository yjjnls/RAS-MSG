/*
* RAS implementation
*/

'use strict'

const http = require('http');
const url = require('url');
let message = require('./message.js').msg;
const msg_state = require('./message.js').msg_state;
const colors = require('colors');
let mq = require('./mq.js');

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

  res.writeHead(status_code, {
    "Content-Type": "application/octet-stream",
    "Connection": "Keep-Alive"
  });
  res.write(content);
  res.end();

  info(content);
}
//todo recover rom redis
/*----------------------------------------------------------------------------------- */
http.createServer((req, res) => {
  let chunk = [];

  req.on('data', function (data) {
    chunk.push(data);
  });

  req.on('end', function () {
    let buf = Buffer.concat(chunk);
    info(buf.toString());

    OnMessage(buf, req, res);
    // if (req.method == 'POST') {
    //   let uuid = UUID.v1();
    //   send(res, 200, JSON.stringify({ "uuid": uuid }));
    // }
    // else
    //   send(res, 200, 'OK');
  })
}).listen(8000);

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
  if (uri.pathname == '/msg') {
    switch (req.method) {
      case 'POST':
        prepare(res, dataObj, uri.query.topic, uri.headers.from);
        break;
      case 'PUT':
        publish(res, uri.query.id);
        break;
      case 'DELETE':
        consume(res, uri.query.id);
        break;
    }
  }
  error('API Not found!');
  send(res, 400, 'API Not found!');
}
msgs = []
async function prepare(res, data, topic, from) {
  if (!topic || !from) {
    send(res, 400, 'Invalid parameters!');
    return;
  }
  // create msg
  var msg_id = Date.now();
  let msg = new message(msg_id, topic, from);
  // store msg
  try {
    await mq.store_msg(msg_id, data, from, topic);
    msgs.push(msg);
  } catch (error) {
    send(res, 500, error.message);
    return;
  }
  // monitor msg
  msg.on('prepared timeout', () => {
    // todo...
  });
  // return 200 OK
  send(res, 200, JSON.stringify({ "uuid": msg_id }));
}

async function publish(res, id) {
  // get msg by id 
  let msg = undefined;
  for (var i = 0; i < msgs.length; ++i) {
    if (msgs[i].id_ == id) {
      msg = msgs[i];
      break;
    }
  }
  if (msg == undefined) {
    send(res, 400, 'Invalid parameters, can\'t find message!');
    return;
  }
  // clear prepared timeout
  msg.ClearTimeout();
  // change msg state and monitor msg
  msg.ChangeState(msg_state[1]);
  msg.SetTimeout();
  msg.on('published timeout', () => {
    // post msg to MQ again
    // todo...
  });
  // post msg to MQ
  try {
    await mq.publish(id);
  } catch (error) {
    send(res, 500, error.message);
    return;
  }
  // return 200 OK
  send(res, 200, "OK");

}

async function consume(res, id) {
  // get msg by id
  let msg = undefined;
  for (var i = 0; i < msgs.length; ++i) {
    if (msgs[i].id_ == id) {
      msg = msgs[i];
      break;
    }
  }
  if (msg == undefined) {
    send(res, 400, 'Invalid parameters, can\'t find message!');
    return;
  }
  // clear published timeout
  msg.ClearTimeout();
  // remove msg in db according id
  if (await is_msg_consumed(msg.topic_, id)) {
    console.log(`msg[${id}] consumed!`);
    await unpublish(msg.topic_, id);
    await del_msg(id);
  }
  // return 200 OK
  send(res, 200, "OK");
}