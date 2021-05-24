/**
 * パーティクル崩し html5版
 * 3-10-1-cyndi
 *
 * Original source code
 * Copyright coppieee ( http://wonderfl.net/user/coppieee )
 * MIT License ( http://www.opensource.org/licenses/mit-license.php )
 * Downloaded from: http://wonderfl.net/c/tNGi
 */
var Particle = /** @class */ (function () {
    function Particle(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.vx = 0;
        this.vy = 0;
        this.x = x;
        this.y = y;
    }
    Particle.prototype.X = function () {
        return Math.round(this.x);
    };
    Particle.prototype.Y = function () {
        return Math.round(this.y);
    };
    return Particle;
}());
var ColorHSV = /** @class */ (function () {
    function ColorHSV() {
        this.h = 0.0;
        this.s = 1.0;
        this.v = 1.0;
    }
    ColorHSV.prototype.value = function () { return this.hsv2rgb(); };
    ColorHSV.prototype.hsv2rgb = function () {
        var h = this.h / 60;
        var s = this.s;
        var v = this.v;
        if (s == 0)
            return [v * 255, v * 255, v * 255];
        var rgb;
        var i = Math.floor(h);
        ;
        var f = h - i;
        var v1 = v * (1 - s);
        var v2 = v * (1 - s * f);
        var v3 = v * (1 - s * (1 - f));
        switch (i) {
            case 0:
            case 6:
                rgb = [v, v3, v1];
                break;
            case 1:
                rgb = [v2, v, v1];
                break;
            case 2:
                rgb = [v1, v, v3];
                break;
            case 3:
                rgb = [v1, v2, v];
                break;
            case 4:
                rgb = [v3, v1, v];
                break;
            case 5:
                rgb = [v, v1, v2];
                break;
        }
        return rgb.map(function (value) {
            return value * 255;
        });
    };
    return ColorHSV;
}());
var Blocks = /** @class */ (function () {
    function Blocks(width, height) {
        this._width = width;
        this._height = height;
        this._count = width * height;
        this.values = new Array(width * height);
        var c = new ColorHSV();
        for (var i = 0; i < this._width; i++) {
            c.h = 360 * i / this._width;
            for (var j = 0; j < this._height; j++) {
                var p = new Particle(i, j);
                p.color = c.value();
                this.values[i + j * this._width] = p;
            }
        }
    }
    Blocks.prototype.count = function () { return this._count; };
    Blocks.prototype.width = function () { return this._width; };
    Blocks.prototype.height = function () { return this._height; };
    Blocks.prototype.getParticle = function (x, y) {
        var index = x + y * this._width;
        if (index >= this.values.length || index < 0) {
            return null;
        }
        return this.values[x + y * this._width];
    };
    Blocks.prototype.removeParticle = function (x, y) {
        var p = this.values[x + y * this._width];
        if (p) {
            this._count--;
            this.values[x + y * this._width] = undefined;
        }
        return p;
    };
    return Blocks;
}());
var Bar = /** @class */ (function () {
    function Bar(width, height) {
        this.x = 0;
        this.y = 0;
        this.width = 50;
        this.height = 10;
        this.width = width;
        this.height = height;
    }
    Bar.prototype.hitTestPoint = function (x, y) {
        if (x >= this.x && x <= this.x + this.width && y >= this.y && this.y <= this.y + this.height) {
            return true;
        }
        else {
            return false;
        }
    };
    return Bar;
}());
var BlockBreaker = /** @class */ (function () {
    function BlockBreaker(canvas) {
        var _this = this;
        this.update = function () {
            _this._ctx.clearRect(0, 0, _this._canvas.width, _this._canvas.height);
            _this._data = _this._ctx.getImageData(0, 0, _this._canvas.width, _this._canvas.height);
            var widthBase = _this._data.width * 4;
            var data = _this._data.data;
            _this._blocks.values.forEach(function (block) {
                if (block) {
                    //_canvas.setPixel(block.x, block.y, block.color);
                    var idx = ((block.y * widthBase) + (block.x * 4));
                    data[idx] = block.color[0]; //R
                    data[idx + 1] = block.color[1]; //G
                    data[idx + 2] = block.color[2]; //B
                    data[idx + 3] = 0xFF; //A
                }
            });
            var removeBalls = new Array();
            _this._balls.forEach(function (ball) {
                var bvx = ball.vx;
                var bvy = ball.vy;
                var bspeed = Math.sqrt(bvx * bvx + bvy * bvy);
                var bradius = Math.atan2(bvy, bvx);
                for (var i = 0; i < bspeed; i++) {
                    ball.x += ball.vx / bspeed;
                    ball.y += ball.vy / bspeed;
                    var hitParticle = _this._blocks.getParticle(ball.X(), ball.Y());
                    if (hitParticle) {
                        var removedP = _this._blocks.removeParticle(ball.X(), ball.Y());
                        removedP.vx = Math.cos(bradius + Math.PI * 2 / (30 * Math.random()) - 15) * 3;
                        removedP.vy = 1;
                        removedP.color = hitParticle.color;
                        _this._fallBlocks.push(removedP);
                        ball.vy = -ball.vy;
                    }
                    if ((ball.x < 0 && ball.vx < 0) || (ball.x > BlockBreaker.WIDTH && ball.vx > 0)) {
                        ball.vx = -ball.vx;
                    }
                    if (ball.y < 0 && ball.vy < 0) {
                        ball.vy = -ball.vy;
                    }
                    if (ball.y > BlockBreaker.HEIGHT) {
                        removeBalls.push(ball);
                    }
                    if (_this._bar.hitTestPoint(ball.x, ball.y)) {
                        ball.vy = -Math.abs(ball.vy);
                    }
                    //_canvas.setPixel(ball.x, ball.y, ball.color);\
                    var idx = (ball.Y() * widthBase) + (ball.X() * 4);
                    data[idx] = ball.color[0]; //R
                    data[idx + 1] = ball.color[1]; //G
                    data[idx + 2] = ball.color[2]; //B
                    data[idx + 3] = 0xFF; //A
                }
            });
            removeBalls.forEach(function (b) {
                var index = _this._balls.indexOf(b);
                if (index != -1) {
                    _this._balls.splice(index, 1);
                }
            });
            var removeFallBs = new Array();
            _this._fallBlocks.forEach(function (fallP) {
                fallP.vy += 0.1;
                fallP.x += fallP.vx;
                fallP.y += fallP.vy;
                //_canvas.setPixel(fallP.x, fallP.y, fallP.color);
                var idx = ((fallP.Y() * widthBase) + (fallP.X() * 4));
                data[idx] = fallP.color[0]; //R
                data[idx + 1] = fallP.color[1]; //G
                data[idx + 2] = fallP.color[2]; //B
                data[idx + 3] = 0xFF; //A
                if (_this._bar.hitTestPoint(fallP.x, fallP.y)) {
                    var newball = new Particle(fallP.x, fallP.y);
                    newball.vx = Math.random() * 10;
                    newball.vy = Math.random() * 9 + 1;
                    newball.color = fallP.color;
                    _this._balls.push(newball);
                    removeFallBs.push(fallP);
                }
                else if (fallP.y > BlockBreaker.HEIGHT) {
                    removeFallBs.push(fallP);
                }
            });
            removeFallBs.forEach(function (b) {
                var index = _this._fallBlocks.indexOf(b);
                if (index != -1) {
                    _this._fallBlocks.splice(index, 1);
                }
            });
            //描画
            _this._ctx.putImageData(_this._data, 0, 0);
            if (_this._blocks.count() == 0) {
                alert("CLEAR!\nおめでと");
                _this.init();
            }
            else if (_this._balls.length == 0) {
                alert("ゲームオーバー");
                _this.init();
            }
            else {
                window.requestAnimationFrame(_this.update.bind(_this));
            }
            //bar
            _this._ctx.beginPath();
            _this._ctx.fillStyle = "red";
            _this._ctx.fillRect(_this._bar.x, _this._bar.y, _this._bar.width, _this._bar.height);
            _this._ctx.stroke();
        };
        this.touchmove = function (evt) {
            _this._bar.x = evt.touches[0].clientX - _this._canvas.offsetLeft - (_this._bar.width / 2);
            if (_this._bar.x + _this._bar.width > BlockBreaker.WIDTH) {
                _this._bar.x = BlockBreaker.WIDTH - _this._bar.width;
            }
            if (_this._bar.x < 0) {
                _this._bar.x = 0;
            }
            evt.preventDefault();
        };
        this.mousemove = function (evt) {
            _this._bar.x = evt.clientX - _this._canvas.offsetLeft - (_this._bar.width / 2);
            if (_this._bar.x + _this._bar.width > BlockBreaker.WIDTH) {
                _this._bar.x = BlockBreaker.WIDTH - _this._bar.width;
            }
            if (_this._bar.x < 0) {
                _this._bar.x = 0;
            }
        };
        this.init = function () {
            _this._blocks = new Blocks(BlockBreaker.WIDTH, 100);
            _this._fallBlocks = new Array();
            _this._bar = new Bar(200, 10);
            _this._bar.y = BlockBreaker.HEIGHT - _this._bar.height - 2;
            var _ball = new Particle(BlockBreaker.WIDTH / 2, BlockBreaker.HEIGHT / 2);
            _ball.vx = Math.random() * 10;
            _ball.vy = -Math.random() * 9 - 1;
            _ball.color = [0xFF, 0xFF, 0xFF];
            _this._balls = new Array();
            _this._balls.push(_ball);
            window.requestAnimationFrame(_this.update.bind(_this));
        };
        this._canvas = canvas;
        this._ctx = this._canvas.getContext("2d");
        canvas.addEventListener('mousemove', this.mousemove.bind(this), false);
        canvas.addEventListener('touchmove', this.touchmove.bind(this), false);
        this.init();
    }
    BlockBreaker.HEIGHT = 465;
    BlockBreaker.WIDTH = 465;
    return BlockBreaker;
}());
window.addEventListener("load", function (e) {
    var canvas = document.getElementById("canvas");
    var blockBreaker = new BlockBreaker(canvas);
});
//# sourceMappingURL=particlebreaker.js.map