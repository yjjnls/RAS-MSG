'use strict'
const request = require('../lib/request.js');
async function test() {
    for (var i = 0; i < 1; ++i) {
        let data = { "data": new Date() };
        await request.Request('POST', 'http://127.0.0.1:8001/zhifubao', 3000, undefined, data)
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(`post_msg error: [ ${err} ]`);
                throw new Error(err.toString());
            })
    }
}

test()