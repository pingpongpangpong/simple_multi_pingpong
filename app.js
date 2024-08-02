const http = require("http");
const path = require("path");
const express = require("express");
const socketio = require("socket.io");

const Game = require('./Game');

const PORT = 5000;
const FRAME_TIME = Math.floor(1000 / 60);

var app = express();
var server = http.Server(app);
var io = socketio(server, {pingInterval: 1000});
let game = new Game(io);

app.set('port', PORT);
app.use('/', express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

setInterval(function() {
    if (game && game.count == 2) {
        game.update();
        game.sendState();
    }
}, FRAME_TIME);

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
