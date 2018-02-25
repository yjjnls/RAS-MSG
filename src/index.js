'use strict'

const http = require('http');
const UUID = require('uuid');
var message = require('./message.js').msg;
const msg_state = require('./message.js').msg_state;

http.createServer((req, res) => {
  res.end();
}).listen(8000);


function prepare(data, addr) {
  // create msg
  let msg = new message(data, addr);
  var msg_id = UUID.v1();
  // store msg
  //todo...
  // monitor msg
  msg.on('prepared timeout', () => {
    // todo...
  });
  // return 200 OK
  // todo...  
}

function publish(id) {
  // get msg by id
  let msg;
  // todo...
  // clear prepared timeout
  msg.Clear_Timeout();
  // change msg state and monitor msg
  msg.Change_State(msg_state[1]);
  msg.SetTimeout();
  msg.on('published timeout', () => {
    // todo...
  });
  // post msg to MQ
  // todo...
  // return 200 OK
  // todo...

}

function consume(id) {
  // get msg by id
  let msg;
  // todo...
  // clear published timeout
  msg.Clear_Timeout();
  // remove msg
  // todo...
  // return 200 OK
  // todo...
}