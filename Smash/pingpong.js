var WIDTH = 700,
    HEIGHT = 600,
    pi = Math.PI;
var upArrow = 38,
    DownArrow = 40;
var canvas, cntxt, keystate;
var player, ball, ai;
var time;
var gameEnd = false;
var level = 1;
var currLevel;
var playerSpeed = 6;
var aiSpeedMultiplier = 0.1;
var pscore = document.getElementById("pScore");
var AiScore = document.getElementById("AiScore");
var showLevel = document.getElementById("level");
var regameBtn = document.getElementById("regame");
// var winnerdiv = document.getElementById("winner");

function scoreupdate() {
    if (gameEnd == false) {
        pscore.innerHTML = player.score.toString();
        AiScore.innerHTML = ai.score.toString();
        showLevel.innerHTML = level.toString();
    }

    if (gameEnd == true) {
        pscore.innerHTML = " ";
        AiScore.innerHTML = " ";
        showLevel.innerHTML = " ";
    }



}

function nextLevel() {

    init();
    gameEnd = false;

    level += 1;
    ball.speed += 2;
    playerSpeed += 1.5;
    aiSpeedMultiplier += 0.05;
    console.log("NExt level ");
}


function showNextModal() {

    if (level == 20 && player.score == 100 && ai.score < 100) {
        gameComplete();
    } else if (player.score == 100 && ai.score < 100) {
        $("#next").html("<h2>Looks like you have got that spark </h2>");
        $("#Next").text("Follow Me To The Next Level");
        $("#nextLevel").modal({
            backdrop: "static"
        });
        gameEnd = true;



    }

}

function gameover() {
    init();
    gameEnd = false;
    console.log("Game Over");
    return;
}


function showGameOver() {
    if (player.score < 100 && ai.score == 100) {


        $("#winner").html("<h2>Oh ! Oh ! You Lost</h2>");
        $("#tryAgain").text("Battle Again");
        $("#gameoverModal").modal({
            backdrop: "static"

        });
        gameEnd = true;




    }
}

$(document).ready(function () {
    $("#myModal").modal({
        backdrop: "static"
    });

    $("#startgame").click(function () {
        main();
    });




    //---------------------------------


});

$("#newgame").click(function () {
    //            init();
    location.reload();
});


player = {
    x: null,
    score: 0,
    y: null,
    width: 20,
    height: 100,
    update: function () {
        if (keystate[upArrow]) {
            this.y -= playerSpeed;

        }
        if (keystate[DownArrow]) {
            this.y += playerSpeed;

        }
        this.y = Math.max(Math.min(this.y, HEIGHT - this.height), 0);

    },
    draw: function () {

        cntxt.fillRect(this.x, this.y, this.width, this.height);
    }
};
ai = {
    x: null,
    y: null,
    score: 0,
    width: 20,
    height: 100,
    update: function () {
        var PosWRTball = ball.y - (this.height - ball.side) * 0.5;
        this.y += (PosWRTball - this.y) * aiSpeedMultiplier;
        this.y = Math.max(Math.min(this.y, HEIGHT - this.height), 0);
    },
    draw: function () {
        cntxt.fillRect(this.x, this.y, this.width, this.height);
    }
};
ball = {
    x: null,
    y: null,
    side: 30,
    speed: 10,
    vel: null,
    serve: function (side) {
        var r = Math.random();
        this.x = side === 1 ? (player.x + player.width + this.side / 2) : ai.x - this.side;
        this.y = (HEIGHT - this.side) * r;
        var angle = 0.1 * pi * (1 - 2 * r);

        this.vel = {
            x: this.speed * side * Math.cos(angle),
            y: this.speed * Math.sin(angle)
        }
    },

    update: function () {
        this.x += this.vel.x;
        this.y += this.vel.y;
        if (0 > this.y || this.y + this.side > HEIGHT) {
            var offset = this.vel.y < 0 ? 0 - this.y : HEIGHT - (this.y + this.side);
            this.y += 2 * offset;
            this.vel.y *= -1;
        }

        var BBIntersect = function (x1, y1, w1, h1, x2, y2, w2, h2) {
            return x1 < x2 + w2 && y1 < y2 + h2 && x2 < x1 + w1 && y2 < y1 + h1;
        };

        var pdle = this.vel.x < 0 ? player : ai;
        if (BBIntersect(pdle.x, pdle.y, pdle.width, pdle.height, this.x, this.y, this.side / 2, this.side / 2)) {
            this.x = (pdle === player ? (player.x + player.width + this.side / 2) : ai.x - this.side / 2);
            var n = (this.y + this.side - pdle.y) / (pdle.height + this.side);
            var angle = 0.25 * pi * (2 * n - 1);


            var smash = Math.abs(angle) > 0.2 * pi ? 1.5 : 1;
            this.vel.x = smash * (pdle === player ? 1 : -1) * (this.speed) * Math.cos(angle);
            this.vel.y = smash * (this.speed) * (Math.sin(angle));
        }

        if (this.x + (this.side) < 0) {

            if (gameEnd == false) {
                ai.score += 10;
                scoreupdate();

                this.serve(pdle === player ? 1 : -1);
            }
            if (player.score == 100) {
                showNextModal();
            } else {
                if (ai.score == 100) {
                    showGameOver();
                }
            }
        }
        if (this.x > WIDTH) {

            if (gameEnd == false) {
                player.score += 10;
                scoreupdate();

                this.serve(pdle === player ? 1 : -1);

            }
            if (player.score == 100) {
                showNextModal();
            } else {
                if (ai.score == 100) {
                    showGameOver();
                }
            }
        }

    },
    draw: function () {
        // cntxt.fillRect(this.x, this.y, this.side, this.side);
        cntxt.beginPath();
        cntxt.arc(this.x, this.y, this.side / 2, 0, 2 * Math.PI);
        // cntxt.fillStyle = "white";
        cntxt.fill();
    }
};



function main() {
    canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.id = "GameCanvas";
    cntxt = canvas.getContext("2d");
    document.body.appendChild(canvas);
    keystate = {};
    document.addEventListener("keydown", function (evt) {

        keystate[evt.keyCode] = true;

    });
    document.addEventListener("keyup", function (evt) {

        delete keystate[evt.keyCode];

    });
    init();

    var loop = function () {
        update();
        draw();

        window.requestAnimationFrame(loop, canvas);

    };
    window.requestAnimationFrame(loop, canvas);

}

function init() {
    player.x = player.width;
    player.y = (HEIGHT - player.height) / 2;
    ai.x = WIDTH - (player.width + ai.width);
    ai.y = (HEIGHT - ai.height) / 2;
    //            ball.x = (WIDTH - ball.side) / 2;
    //            ball.y = (HEIGHT - ball.side) / 2;
    //            ball.vel = {
    //                x: ball.speed,
    //                y: 0
    //            }
    player.score = 0;
    ai.score = 0;
    time = 0.0;
    ball.serve(1);
}

function update() {

    player.update();
    ball.update();
    ai.update();

}

function draw() {
    cntxt.fillStyle = "green"
    cntxt.fillRect(0, 0, WIDTH, HEIGHT);
    cntxt.save();
    cntxt.fillStyle = "#FFF";

    player.draw();
    ball.draw();
    ai.draw();
    scoreupdate();
    var w = 4;
    var x = (WIDTH - w) * 0.5;
    var y = 0;
    var step = HEIGHT / 20;
    while (y < HEIGHT) {
        cntxt.fillRect(x, y + step * 0.25, w, step * 0.5);
        y += step;
    }
    cntxt.restore();

}

function gameComplete() {
    $("#Gc").html("<h2>Woo Hoo... You're a champion now </h2>");
    $("#again").text("Play  Again ");
    $("#gameComplete").modal({
        backdrop: "static"
    });
}

function reload() {
    location.reload();
}
