const canvas = {width: 480, height: 360};
const paddle = {width: 12, height: 72};
const ballRadius = 2;
const getRandom = (min, max) => Math.random() * (max - min) + min;

class Player {
    constructor(id, pos) {
        this.id = id;
        this.pos = pos;
        if (pos == 'LEFT') {
            this.position = {x: 0, y: (canvas.height - paddle.height) / 2};
        } else if (pos == "RIGHT") {
            this.position = {x: canvas.width - paddle.width, y: (canvas.height - paddle.height) / 2};
        }
        this.speed = 4;
        this.input = {};
    }

    update() {
        let Input = 0;
        if (this.input.UP && this.position.y >= 0) Input--;
        if (this.input.DOWN && this.position.y + paddle.height <= canvas.height) Input++;
        this.position.y += Input * this.speed;
    }
    
    setButton(button, value) {
        this.input[button] = value;
    }

    getDrawInfo() {
        return {
            position: this.position,
            side: this.pos,
        }
    }
}

module.exports = Player;