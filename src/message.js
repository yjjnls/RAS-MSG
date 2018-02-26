'use strict'

const EventEmitter = require('events').EventEmitter;

const msg_state = ['prepared', 'published', 'consumed'];

class msg extends EventEmitter {
    construct(data, topic) {
        // msg data
        this.data_ = data;
        // msg topic
        this.topic_ = topic;
        // msg state
        this.state_ = msg_state[0];
        // msg state timeout
        this.timeout_ = 300;
        this.timeout_instance_ = Set_Timeout();
    }
    Change_State(state) {
        if (msg_state.indexOf(state) == -1) {
            return false;
        }
        this.state_ = state;
        return true;
    }
    Set_Timeout() {
        var self = this;
        return setTimeout(() => {
            self.emit(self.state_ + ' timeout');
        }, this.timeout_);
    }
    Clear_Timeout() {
        clearTimeout(this.timeout_instance_);
        this.timeout_instance_ = null;
    }
}

module.exports = {
    msg,
    msg_state
}