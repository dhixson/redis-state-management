"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path = require("path");
const Redis = require("ioredis");
const faker = require("faker");
const command = require("commander");
var channel_history_max = 10;
const app = express();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.set("port", process.env.PORT || 3000);
let http = require("http").Server(app);
// set up socket.io and bind it to our
// http server.
let io = require("socket.io")(http, { cors: { host: '*' } });
app.get("/", (req, res) => {
    res.sendFile(path.resolve("./client/index.html"));
});
// whenever a user connects on port 3000 via
// a websocket, log that a user has connected
io.on("connection", function (socket) {
    console.log("a user connected");
    let get_members = redis.hgetall('members').then(function (redis_members) {
        var members = {};
        for (var key in redis_members) {
            members[key] = JSON.parse(redis_members[key]);
        }
        return members;
    });
    let initialize_member = get_members.then(function (members) {
        if (members[socket.id]) {
            return members[socket.id];
        }
        var username = faker.fake("{{name.firstName}} {{name.lastName}}");
        var member = {
            socket: socket.id,
            username: username
        };
        return redis.hset('members', socket.id, JSON.stringify(member)).then(function () {
            return member;
        });
    });
    let get_stateUpdates = redis.zrange('stateUpdates', -1 * channel_history_max, -1).then(function (result) {
        return result.map(function (x) {
            return JSON.parse(x);
        });
    });
    Promise.all([get_members, initialize_member, get_members]).then(function (values) {
        let members = values[0];
        let member = values[1];
        let messages = values[2];
        io.emit('member_history', members);
        io.emit('message_history', messages);
        redis.publish('member_add', JSON.stringify(member));
        socket.on('send', function (stateUpdate) {
            let date = Date.now();
            let update = JSON.stringify({
                username: member['username'],
                stateUpdate: stateUpdate
            });
            redis.zadd('stateUpdates', date, update);
            redis.publish('stateUpdates', update);
        });
        socket.on('disconnect', function () {
            redis.hdel('members', socket.id);
            redis.publish('member_delete', JSON.stringify(socket.id));
        });
    }).catch(function (error) {
        console.log(`Error: ${error}`);
    });
});
let server;
// redis setup
const redis_address = 'localhost';
const redis = new Redis({ host: redis_address, port: 6379 });
let redis_subscribers = {};
function add_redis_subscribers(subscriber_key) {
    let client = new Redis(redis_address);
    client.subscribe(subscriber_key);
    client.on('message', function (channel, message) {
        io.emit(subscriber_key, JSON.parse(message));
    });
    redis_subscribers[subscriber_key] = client;
}
add_redis_subscribers('stateUpdates');
add_redis_subscribers('member_add');
add_redis_subscribers('member_delete');
function main() {
    command
        .version('0.1.0')
        .command('serve <port>')
        .action((port, cmdObj) => {
        server = http.listen(port, function () {
            console.log(`listening on *:${port}`);
        });
    });
    command.parse(process.argv);
}
main();
//# sourceMappingURL=index.js.map