/**
 * パーティクル崩し html5版
 * 3-10-1-cyndi
 * 
 * Original source code
 * Copyright coppieee ( http://wonderfl.net/user/coppieee )
 * MIT License ( http://www.opensource.org/licenses/mit-license.php )
 * Downloaded from: http://wonderfl.net/c/tNGi
 */


class Particle
{
	x:number;
	y:number;

	vx:number = 0;
	vy:number = 0;
	color:number[];
	constructor(x:number=0, y:number=0 )
	{
		this.x = x;
		this.y = y;
	}

    public X():number{
        return Math.round(this.x);
    }
    public Y():number{
        return Math.round(this.y);
    }
}

class ColorHSV{
    h:number  = 0.0;
    s:number  = 1.0;
    v:number  = 1.0;
    value():number[] {  return this.hsv2rgb()}

    hsv2rgb () {
        var h = this.h / 60 ;
        var s = this.s ;
        var v = this.v ;
        if ( s == 0 ) return [ v * 255, v * 255, v * 255 ] ;
    
        var rgb ;
        var i = Math.floor(h);;
        var f = h - i ;
        var v1 = v * (1 - s) ;
        var v2 = v * (1 - s * f) ;
        var v3 = v * (1 - s * (1 - f)) ;
    
        switch( i ) {
            case 0 :
            case 6 :
                rgb = [ v, v3, v1 ] ;
            break ;
    
            case 1 :
                rgb = [ v2, v, v1 ] ;
            break ;
    
            case 2 :
                rgb = [ v1, v, v3 ] ;
            break ;
    
            case 3 :
                rgb = [ v1, v2, v ] ;
            break ;
    
            case 4 :
                rgb = [ v3, v1, v ] ;
            break ;
    
            case 5 :
                rgb = [ v, v1, v2 ] ;
            break ;
        }
    
        return rgb.map( function ( value ) {
            return value * 255 ;
        } ) ;
    }
    
}

class Blocks
{
    private _count:number;
	count(){ return this._count;}
	private _width:number;
	width():number { return this._width; }
	private _height:number;
	height():number { return this._height; }
	values:Particle[];
	constructor(width:number, height:number)
	{
		this._width = width;
		this._height = height;
		this._count = width * height;
		this.values = new Array(width * height);
		var c:ColorHSV = new ColorHSV();
		for (var i:number = 0; i < this._width; i++)
		{
			c.h = 360 * i / this._width;
			for (var j:number = 0 ; j < this._height; j++ )
			{
				var p:Particle = new Particle(i, j);
				p.color = c.value();
				this.values[i + j * this._width] = p;
			}
		}
	}
	getParticle(x:number, y:number):Particle
	{
		var index:number = x + y * this._width;
		if (index >= this.values.length || index < 0)
		{
			return null;
		}
		return this.values[x + y * this._width];
	}
	removeParticle(x:number, y:number):Particle
	{
		var p:Particle = this.values[x + y * this._width];
		if (p)
		{
			this._count--;
			this.values[x + y * this._width] = undefined;
		}
		return p;
	}
}


class Bar
{
    x:number = 0;
    y:number = 0;
    width:number = 50;
    height:number = 10;

    hitTestPoint(x:number, y:number):boolean{
        if(x >= this.x && x <= this.x + this.width && y >= this.y  && this.y <= this.y + this.height){
            return true;
        }else{
            return false;
        }
    }

    constructor(width:number, height:number){
        this.width = width;
        this.height = height;
    }
}

class BlockBreaker
{
    private static HEIGHT:number = 465;
    private static WIDTH:number = 465;
    private _canvas:HTMLCanvasElement;
    private _ctx:CanvasRenderingContext2D;
    private _data:ImageData;
    private _blocks:Blocks;
    private _fallBlocks:Particle[];
    private _balls:Particle[];
    private _bar:Bar;
    

    public update = () =>
    {
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._data = this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);

        var widthBase = this._data.width * 4;
        var data = this._data.data;
        this._blocks.values.forEach(block => {
            if (block)
            {
                //_canvas.setPixel(block.x, block.y, block.color);
                var idx = ((block.y * widthBase) + (block.x * 4));
                data[idx] = block.color[0]; //R
                data[idx + 1] = block.color[1]; //G
                data[idx + 2] = block.color[2]; //B
                data[idx + 3] = 0xFF; //A
            }
        });


        var removeBalls:Particle[] = new Array();
        this._balls.forEach(ball => {

            var bvx:number = ball.vx;
            var bvy:number = ball.vy;
            var bspeed:number = Math.sqrt(bvx * bvx + bvy * bvy);
            var bradius:number = Math.atan2(bvy, bvx);
            for (var i = 0; i < bspeed;i++)
            {
                ball.x += ball.vx/bspeed;
                ball.y += ball.vy/bspeed;

                var hitParticle:Particle = this._blocks.getParticle(ball.X(), ball.Y());
                if(hitParticle)
                {
                    var removedP:Particle = this._blocks.removeParticle(ball.X(), ball.Y());
                    removedP.vx = Math.cos(bradius+Math.PI*2/(30*Math.random())-15)*3;
                    removedP.vy = 1;
                    removedP.color = hitParticle.color;
                    this._fallBlocks.push(removedP);
                    ball.vy = -ball.vy;
                }
                
                if ((ball.x < 0 && ball.vx < 0) || (ball.x > BlockBreaker.WIDTH && ball.vx > 0))
                {
                    ball.vx = -ball.vx;
                }
                if (ball.y < 0 && ball.vy < 0)
                {
                    ball.vy = -ball.vy;
                }
                if (ball.y > BlockBreaker.HEIGHT)
                {
                    removeBalls.push(ball);
                }
                if (this._bar.hitTestPoint(ball.x, ball.y))
                {
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

        removeBalls.forEach(b => {
            var index = this._balls.indexOf(b);
            if (index != -1)
            {
                this._balls.splice(index, 1);
            }
        });
        
        var removeFallBs:Particle[] = new Array();
        this._fallBlocks.forEach(fallP => {
            fallP.vy += 0.1;
            fallP.x += fallP.vx;
            fallP.y += fallP.vy;
            //_canvas.setPixel(fallP.x, fallP.y, fallP.color);
            var idx = ((fallP.Y() * widthBase) + (fallP.X() * 4));
            data[idx] = fallP.color[0]; //R
            data[idx + 1] = fallP.color[1]; //G
            data[idx + 2] = fallP.color[2]; //B
            data[idx + 3] = 0xFF; //A

            if (this._bar.hitTestPoint(fallP.x,fallP.y))
            {
                var newball:Particle = new Particle(fallP.x,fallP.y);
                newball.vx = Math.random() * 10;
                newball.vy = Math.random() * 9 + 1;
                newball.color = fallP.color;
                this._balls.push(newball);
                removeFallBs.push(fallP);
            }else if (fallP.y > BlockBreaker.HEIGHT)
            {
                removeFallBs.push(fallP);
            }
        });
        
        removeFallBs.forEach(b => {
            var index = this._fallBlocks.indexOf(b);
            if (index != -1)
            {
                this._fallBlocks.splice(index, 1);
            }
        });
        
        //描画
        this._ctx.putImageData(this._data, 0, 0);

        if (this._blocks.count() == 0)
        {
            alert("CLEAR!\nおめでと");
            this.init();
        }else if(this._balls.length == 0){
            alert("ゲームオーバー");
            this.init();
        }else{
            window.requestAnimationFrame(this.update.bind(this));
        }

        //bar
        this._ctx.beginPath();
        this._ctx.fillStyle = "red";
        this._ctx.fillRect(this._bar.x, this._bar.y, this._bar.width, this._bar.height);
        this._ctx.stroke();
    }

    public touchmove = (evt) =>{
        this._bar.x = evt.touches[0].clientX - this._canvas.offsetLeft - (this._bar.width / 2);
        if(this._bar.x + this._bar.width > BlockBreaker.WIDTH){
            this._bar.x = BlockBreaker.WIDTH - this._bar.width;
        }
        if(this._bar.x < 0){
            this._bar.x = 0;
        }
        evt.preventDefault();
    }

    public mousemove = (evt) =>{
        this._bar.x = evt.clientX - this._canvas.offsetLeft - (this._bar.width / 2);
        if(this._bar.x + this._bar.width > BlockBreaker.WIDTH){
            this._bar.x = BlockBreaker.WIDTH - this._bar.width;
        }
        if(this._bar.x < 0){
            this._bar.x = 0;
        }
    }

    public init =() =>{
        this._blocks = new Blocks(BlockBreaker.WIDTH, 100);
        
        this._fallBlocks = new Array();
        
        this._bar = new Bar(200, 10);
        this._bar.y = BlockBreaker.HEIGHT - this._bar.height - 2;

        var _ball:Particle = new Particle(BlockBreaker.WIDTH / 2, BlockBreaker.HEIGHT / 2);
        _ball.vx = Math.random() * 10;
        _ball.vy = -Math.random() * 9 -1;
        _ball.color = [0xFF, 0xFF, 0xFF];
        
        this._balls = new Array();
        this._balls.push(_ball);

        window.requestAnimationFrame(this.update.bind(this));
    }

    constructor(canvas:HTMLCanvasElement)
    {
        this._canvas = canvas;
        this._ctx = this._canvas.getContext("2d");
        canvas.addEventListener('mousemove', this.mousemove.bind(this), false);
        canvas.addEventListener('touchmove', this.touchmove.bind(this), false);

        this.init();
    }
}
window.addEventListener("load", (e) => {
    var canvas = document.getElementById("canvas") as HTMLCanvasElement;
    var blockBreaker:BlockBreaker = new BlockBreaker(canvas);
});

