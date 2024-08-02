const paddle = {width: 12, height: 72};
const ballRadius = 2;
const getRandom = (min, max) => Math.random() * (max - min) + min;

const socket = io();
socket.on("message", function(data) {
    console.log(data);
});

const keyMap = {
    38: "UP",
    40: "DOWN",
}

var inputs = {};

const setButton = (button, value) => {
    if (button !== undefined && inputs[button] !== value) {
        inputs[button] = value;
        socket.emit("setButton", {button: button, value: value});
    }
}

function drawBall(context, ball) {
    if (ball) {
        context.beginPath();
        context.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
        context.fillStyle = "black";
        context.fill();
        context.closePath();
    }
}

function drawPaddle(context, players) {
    if (players) {
        players.forEach((player) => {
            context.beginPath();
            context.rect(player.position.x, player.position.y, paddle.width, paddle.height);
            if (player.side == "LEFT") context.fillStyle = "red";
            if (player.side == "RIGHT") context.fillStyle = "blue";
            context.fill();
            context.closePath();
        });
    }
}

document.addEventListener("keydown", function(e) {
    let button = keyMap[e.keyCode];
    setButton(button, true);
});

document.addEventListener("keyup", function(e) {
    let button = keyMap[e.keyCode];
    setButton(button, false);
})

const cv = document.getElementById('GameScreen');
const ct = cv.getContext('2d');

socket.on("sendState", function(state) {
    ct.clearRect(0, 0, cv.width, cv.height);
    drawBall(ct, state.ball);
    drawPaddle(ct, state.players);
})