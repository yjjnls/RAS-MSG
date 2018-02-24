'use strict'

const http = require('http');

http.createServer((req, res) => {
  res.end();
}).listen(8000); 