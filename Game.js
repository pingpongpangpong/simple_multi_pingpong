const canvas = {width: 480, height: 360};
const paddle = {width: 12, height: 72};
const ballRadius = 2;
const getRandom = (min, max) => Math.random() * (max - min) + min;

var Player = require('./Player');

class Game {
    
    constructor(io) {
        this.io = io;
        this.players = {};
        this.count = 0;
        this.ball = {
            position: {
                x: canvas.width / 2,
                y: canvas.height / 2,
            },
            xdir: getRandom(-3, 3),
            ydir: getRandom(-3, 3),
        }

        this.io.on("connection", (socket) => {
            if (this.count == 0) {
                this.players[socket.id] = new Player(socket.id, "LEFT");
            } else if (this.count == 1) {
                this.players[socket.id] = new Player(socket.id, "RIGHT");
            } else {
                io.sockets.emit("message", 'Room Full');
                return ;
            }
            this.count++;
            socket.on("disconnect", (reason) => {
                delete this.players[socket.id];
                this.count--;
            });

            socket.on("setButton", ({button, value}) => {
                let player = this.players[socket.id];
                if (player) {
                    player.setButton(button, value);
                }
            });
        });
    }

    isPointInCircle(rx, ry) {
        let deltaX = this.ball.position.x - rx;
        let deltaY = this.ball.position.y - ry;
        let length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (length > ballRadius)
            return false;
        return true;
    }
    
    checkCollision(position) {
        if ((position.x <= this.ball.position.x && this.ball.position.y <= position.x + paddle.width)
            || (position.y <= this.ball.position.y && this.ball.position.y <= position.y + paddle.height)) {
            if ((position.x <= this.ball.position.x && this.ball.position.x <= position.x + paddle.width)
            && (position.y - ballRadius <= this.ball.position.y && this.ball.position.y <= position.y + ballRadius + paddle.height)) {
                this.ball.ydir *= -1;
            }
            if ((position.x - ballRadius < this.ball.position.x && this.ball.position.x < position.x + ballRadius + paddle.width)
            && (position.y <= this.ball.position.y && this.ball.position.y <= position.y + paddle.height)) {
                this.ball.xdir *= -1;
            }
        } else if (this.isPointInCircle(position.x, position.y)
        || this.isPointInCircle(position.x + paddle.width, position.y)
        || this.isPointInCircle(position.x, position.y + paddle.height)
        || this.isPointInCircle(position.x + paddle.width, position.y + paddle.height)) {
            this.ball.xdir *= -1;
            this.ball.ydir *= -1;
        }
    }
    

    update() {
        Object.values(this.players).forEach((player) => {
            if (player) { 
                player.update();
                this.checkCollision(player.position);
            }
        });
        if (this.ball.position.x <= 0 || this.ball.position.x >= canvas.width) {
            this.ball.position.x = canvas.width / 2;
            this.ball.position.y = canvas.height / 2,
            this.ball.xdir = getRandom(-3, 3);
            this.ball.ydir = getRandom(-3, 3);
        }
        if (this.ball.position.y <= ballRadius || this.ball.position.y + ballRadius >= canvas.height)
            this.ball.ydir *= -1;
        this.ball.xdir *= 1.001;
        this.ball.ydir *= 1.001;
        this.ball.position.x += this.ball.xdir;
        this.ball.position.y += this.ball.ydir;
    }

    sendState() {
        let players = Object.values(this.players).map((player) => {
            return player.getDrawInfo();
        })
        this.io.sockets.emit("sendState", {
            players: players,
            ball: this.ball.position,
        });
    }
}

module.exports = Game;