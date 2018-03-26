/*
* Structure to store message data RAS rececived and releated infomations.
* All the messages will be persisted in database.
*/

'use strict'

const EventEmitter = require('events').EventEmitter;

const msg_state = ['prepared', 'published', 'consumed', 'dead'];

class msg extends EventEmitter {
    constructor(id, from, topic) {
        super();
        // msg uuid
        this.id_ = id;
        console.log(this.id_)
        // msg from url
        this.from_url_ = from;
        // msg topic
        this.topic_ = topic;
        // msg state
        this.state_ = msg_state[0];
        // msg state timeout
        this.timeout_ = 3000;
        this.timeout_instance_ = setTimeout(() => {
            this.emit(self.state_ + ' timeout');
        }, this.timeout_);
    }
    ChangeState(state) {
        if (msg_state.indexOf(state) == -1) {
            return false;
        }
        this.state_ = state;
        return true;
    }
    SetTimeout(timeout) {
        var self = this;
        if (timeout == undefined)
            timeout = this.timeout_;
        return setTimeout(() => {
            self.emit(self.state_ + ' timeout');
        }, timeout);
    }
    ClearTimeout() {
        clearTimeout(this.timeout_instance_);
        this.timeout_instance_ = null;
    }
}

module.exports = {
    msg,
    msg_state
}