'use strict'

const EventEmitter = require('events').EventEmitter;

class msg extends EventEmitter {
    construct(data, addr) {
        this.data = data;
        this.dest_addr = addr;

    }
}