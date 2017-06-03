'use strict';
let app = require('express')();
let http = require('http').Server(app);

let io = require('socket.io')(http);

app.get('/', function (req, res) {
    // res.send('<h1>Hello world</h1>');
    res.sendFile(__dirname + "/index_socketio.html");
});

io.on('connection', function (socket) {
    socket.on('my other event', function (msg) {
        console.log('connect msg', msg);
        io.emit('my other event', msg);
        // for (let key in msg) {
        // 	console.log(key);
        // 	console.log(msg[key]);

        // 	io.emit(key, msg[key]);
        // }
    });

    // socket.on('user join', function (user) {
    // 	console.log('connect msg', socket.id);
    // });

    // socket.on('connect', function (msg) {
    //     console.log('connect msg', socket.id);
    // });

    // socket.on('disconnect', function (msg) {
    //     console.log('disconnect msg', socket.id);
    // });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});
