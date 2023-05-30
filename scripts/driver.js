
MySample.main = (function(graphics, input) {
    'use strict';

    let previousTime = performance.now();
    let myKeyboard = input.Keyboard();

    class Primitive {
        constructor(c, v, connect, color){
            this.primitive = {center: c, verts: v};
            this.connect = connect;
            this.color = color;
        }

        scale(s){
            graphics.scalePrimitive(this.primitive, {x:s, y:s});
        }

        rotate(angle){
            graphics.rotatePrimitive(this.primitive, angle);
        }

        translate(distance){
            graphics.translatePrimitive(this.primitive, distance);
        }

        render(){
            graphics.drawPrimitive(this.primitive, this.connect, this.color);
        }
    }
    function randint(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    class Curve {
        constructor(centerx, centery, height, length, lineColor){
            this.type = graphics.Curve.Bezier;
            this.controls = [[centerx - (length/2), centery], [centerx - (length/6), centery - (height/2)], [centerx + (length/6), centery + (height/2)], [centerx + (length/2), centery]];
            this.lineColor = lineColor;
        }
        scale(s){
            graphics.scaleCurve(this.type, this.controls, s);
        }
        rotate(angle){
            graphics.rotateCurve(this.type, this.controls, angle);
        }
        translate(distance){
            graphics.translateCurve(this.type, this.controls, distance);
        }
        render(){
            graphics.drawCurve(this.type, this.controls, 30, false, true, false, this.lineColor);
        }
    }
    class Star {
        constructor(x,y, length){
            let a = new Curve(x, y, 3 * length/4, length, "#FFFFFF");
            a.rotate(45 * Math.PI/ 180);
            let b = new Curve(x, y, 3 * length/4, length, "#FFFFFF");
            b.rotate(90 * Math.PI/ 180);
            let c = new Curve(x, y, 3 * length/4, length, "#FFFFFF");
            c.rotate(135 * Math.PI/ 180);
            let d = new Curve(x, y, 3 * length/4, length, "#FFFFFF");
            d.rotate(180 * Math.PI/ 180);
            let e = new Curve(x, y, 3 * length/4, length, "#FFFFFF");
            e.rotate(-45 * Math.PI/ 180);
            let f = new Curve(x, y, 3 * length/4, length, "#FFFFFF");
            f.rotate(-90 * Math.PI/ 180);
            let g = new Curve(x, y, 3 * length/4, length, "#FFFFFF");
            g.rotate(-135 * Math.PI/ 180);
            this.curves = [
                new Curve(x, y, 3 * length/4, length, "#FFFFFF"),
                a,
                b,
                c,
                d,
                e,
                f,
                g,
            ];
        }

        update(elapsedTime){
            for(let i = 0; i < 8; i ++){
                this.curves[i].rotate(-1 * Math.PI / 180);
            }
        }

        render(){
            for(let i = 0; i < 8; i++){
                this.curves[i].render();
            }
        }
    }
    class Background{
        constructor(){
            this.stars = new Array(100);
            for (let i = 0; i < 100; i++){
                this.stars[i] = new Star(Math.floor(Math.random() * 1000), Math.floor(Math.random() * 1000), 10);
            }
        }

        update(elapsedTime){
            for (let i = 0; i < 100; i ++){
                this.stars[i].update(elapsedTime);
            }
        }

        render(){
            for (let i = 0; i < 100; i ++){
                this.stars[i].render();
            }
        }
    }
    class Asteroid{
        constructor(X, Y, radius, speed, direction, color){
            this.rand = Math.random() < 0.5;
            this.radius = radius;
            this.speed = speed;
            this.direction = direction;
            this.shrinking = false;
            this.primitive = new Primitive({x:X, y:Y}, [
                radius * Math.cos(0 * Math.PI / 180), radius * Math.sin(0 * Math.PI/180),
                radius * Math.cos(45 * Math.PI / 180), radius * Math.sin(45 * Math.PI/180),
                radius * Math.cos(90 * Math.PI / 180), radius * Math.sin(90 * Math.PI/180),
                radius * Math.cos(135 * Math.PI / 180), radius * Math.sin(135 * Math.PI/180),
                radius * Math.cos(180 * Math.PI / 180), radius * Math.sin(180 * Math.PI/180),
                radius * Math.cos(225 * Math.PI / 180), radius * Math.sin(225 * Math.PI/180),
                radius * Math.cos(270 * Math.PI / 180), radius * Math.sin(270 * Math.PI/180),
                radius * Math.cos(315 * Math.PI / 180), radius * Math.sin(315 * Math.PI/180)
                ], true, color);
        }

        update(elapsedTime){
            this.primitive.rotate(this.rand ? Math.PI/180 : -Math.PI/180);
            this.primitive.translate({x: this.speed * Math.cos(this.direction), y: this.speed * Math.sin(this.direction)});
            if (this.shrinking){
                this.primitive.scale(0.9);
                this.radius *= 0.95;
                this.speed *= 0.95;
            }
        }

        render(){
            this.primitive.render();
        }
    }
    class AsteroidMaker{
        constructor(){
            this.asteroid = null;
        }

        update(elapsedTime){
            if (this.asteroid == null){
                let radius = randint(25,175); //random int between 25 and 75 
                let rand = Math.random();
                if (rand < 0.25){
                    this.asteroid = new Asteroid(-radius, randint(250, 750), radius, randint(10, 15), randint(60, 120), "#D2B48C");
                }
                else if (rand >= 0.25 && rand < 0.5){
                    this.asteroid = new Asteroid(1000+radius, randint(250, 750), radius, randint(10, 15), randint(-120, -60), "#D2B48C");
                }
                else if (rand >= 0.5 && rand < 0.75){
                    this.asteroid = new Asteroid(randint(250, 750), -radius, radius, randint(10, 15), randint(-30, 30), "#D2B48C");
                }
                else{
                    this.asteroid = new Asteroid(randint(250, 750), -radius, radius, randint(10, 15), randint(210, 150), "#D2B48C");
                }
                this.asteroid.update();
            }
            else {
                if (this.asteroid.primitive.primitive.center.x > 1000 + this.asteroid.radius || this.asteroid.primitive.primitive.center.x < 0 - this.asteroid.radius || this.asteroid.primitive.primitive.center.y > 1000 + this.asteroid.radius || this.asteroid.primitive.primitive.center.y < 0 - this.asteroid.radius){
                    this.asteroid = null;
                }
                else if (this.asteroid.radius < 5){
                    this.asteroid = null;
                }
                else{
                    this.asteroid.update(elapsedTime);
                }
            }
        }
        render(){
            if (this.asteroid != null){
                this.asteroid.render();
            }
        }
    }
    class Blaster{
        constructor(X,Y,direction, speed, color){
            this.direction = direction;
            this.speed = speed;
            this.primitive = new Primitive({x:X, y:Y}, [
                0, 0,
                50 * direction.x, 50 * direction.y
                ], false, color);
        }

        update(elapsedTime){
            this.primitive.translate({x: this.speed * this.direction.x * elapsedTime /1000, y: this.speed * this.direction.y  * elapsedTime /1000});
        }

        render(){
            this.primitive.render();
        }
    }
    class Player{
        constructor(X, Y, color){
            this.primitive = new Primitive({x:X, y:Y}, [
                0, 50,
                20, -10,
                30, 20,
                40, -20,
                0, -40,
                -40, -20,
                -30, 20,
                -20, -10
                ], true, color);
            this.speed = 0;
            this.dead = false;
            this.blasters = [];
            let angle = Math.PI;
            this.primitive.rotate(angle);
            this.direction = {x:0, y:-1};
        }

        update(elapsedTime, asteroidMaker){
            this.primitive.translate({x: this.speed * this.direction.x * elapsedTime /1000, y: this.speed * this.direction.y  * elapsedTime /1000});
            if (this.primitive.primitive.center.x > 1000){
                this.primitive.primitive.center.x = 1000;
            }
            if (this.primitive.primitive.center.y > 1000){
                this.primitive.primitive.center.y = 1000;
            }
            if (this.primitive.primitive.center.x < 0){
                this.primitive.primitive.center.x = 0;
            }
            if (this.primitive.primitive.center.y < 0){
                this.primitive.primitive.center.y = 0;
            }
            if (asteroidMaker.asteroid != null){
                for (let i = 0; i < this.primitive.primitive.verts.length - 1; i +=2){
                    let a = asteroidMaker.asteroid.primitive.primitive.center.x - (this.primitive.primitive.verts[i] + this.primitive.primitive.center.x);
                    let b = asteroidMaker.asteroid.primitive.primitive.center.y - (this.primitive.primitive.verts[i+1] + this.primitive.primitive.center.y);
                    if (a * a + b * b < asteroidMaker.asteroid.radius * asteroidMaker.asteroid.radius){
                        this.dead = true;
                    }
                }
            }
            for(let i = 0; i < this.blasters.length; i++){
                this.blasters[i].update(elapsedTime);
                if (this.blasters[i].primitive.primitive.center.x < 0 || this.blasters[i].primitive.primitive.center.x > 1000 || this.blasters[i].primitive.primitive.center.y < 0 || this.blasters[i].primitive.primitive.center.y > 1000){
                    this.blasters.splice(i,1);
                }
                else if (asteroidMaker.asteroid != null){
                    let a = asteroidMaker.asteroid.primitive.primitive.center.x - (this.blasters[i].primitive.primitive.verts[0] + this.blasters[i].primitive.primitive.center.x);
                    let b = asteroidMaker.asteroid.primitive.primitive.center.y - (this.blasters[i].primitive.primitive.verts[1] + this.blasters[i].primitive.primitive.center.y);
                    let c = asteroidMaker.asteroid.primitive.primitive.center.x - (this.blasters[i].primitive.primitive.verts[2] + this.blasters[i].primitive.primitive.center.x);
                    let d = asteroidMaker.asteroid.primitive.primitive.center.y - (this.blasters[i].primitive.primitive.verts[3] + this.blasters[i].primitive.primitive.center.y);
                    if (a * a + b * b < asteroidMaker.asteroid.radius * asteroidMaker.asteroid.radius || c * c + d * d < asteroidMaker.asteroid.radius * asteroidMaker.asteroid.radius){
                        asteroidMaker.asteroid.shrinking = true;
                    }
                }
            }
        }

        render(){
            if (!this.dead){
                this.primitive.render();
            }
            for(let i = 0; i < this.blasters.length; i++){
                this.blasters[i].render();
            }
        }
    }
    let reload = {center: {x:0, y:999}, verts:[0,0,0,-50,150,-50,150,0]}
    let timer = 0;
    let background = new Background();
    let asteroidMaker = new AsteroidMaker();
    let player = new Player(500, 500, "#0000FF");


    function increaseSpeed(elapsedTime){
        player.speed += 3000 * elapsedTime / 1000;
        if (player.speed > 500){
            player.speed = 500;
        }
    }
    function decreaseSpeed(elapsedTime){
        player.speed -=  3000 * elapsedTime / 1000;
        if (player.speed < 0){
            player.speed = 0;
        }
    }
    function rotateRight(elapsedTime){
        let angle = 200 * Math.PI/180 * elapsedTime / 1000;
        player.primitive.rotate(angle);
        let newx = player.direction.x*Math.cos(angle) - player.direction.y * Math.sin(angle);
        let newy = player.direction.x*Math.sin(angle) + player.direction.y * Math.cos(angle);
        player.direction.x = newx;
        player.direction.y = newy;
    }
    function rotateLeft(elapsedTime){
        let angle = -200 * Math.PI/180 * elapsedTime / 1000;
        player.primitive.rotate(angle);
        let newx = player.direction.x*Math.cos(angle) - player.direction.y * Math.sin(angle);
        let newy = player.direction.x*Math.sin(angle) + player.direction.y * Math.cos(angle);
        player.direction.x = newx;
        player.direction.y = newy;
    }
    function reset(elapsedTime){
        player = new Player(500, 500, "#0000FF");
    }
    function shoot(elapsedTime){
        if (!player.dead){
            if (timer == 0){
                player.blasters.push(new Blaster(player.primitive.primitive.center.x + player.primitive.primitive.verts[0], player.primitive.primitive.center.y + player.primitive.primitive.verts[1], {x:player.direction.x, y:player.direction.y}, 750, "#FF0000"));
                timer = 1000;
            }
        }
    }
    //------------------------------------------------------------------
    //
    // Scene updates go here.
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
        timer -= elapsedTime;
        if (timer < 0){
            timer = 0;
        }
        background.update(elapsedTime);
        myKeyboard.update(elapsedTime);
        asteroidMaker.update(elapsedTime);
        player.update(elapsedTime, asteroidMaker);
    }

    

    //------------------------------------------------------------------
    //
    // Rendering code goes here
    //
    //------------------------------------------------------------------
    function render() {
        graphics.clear();
        background.render();
        asteroidMaker.render();
        player.render();
        graphics.drawPrimitive(reload, true, "#FF0000");
        if (timer < 900){
            graphics.drawLine(15, 950, 15, 1000, "#FF0000")
        }if (timer < 800){
            graphics.drawLine(30, 950, 30, 1000, "#FF0000")
        }if (timer < 700){
            graphics.drawLine(45, 950, 45, 1000, "#FF0000")
        }if (timer < 600){
            graphics.drawLine(60, 950, 60, 1000, "#FF0000")
        }if (timer < 500){
            graphics.drawLine(75, 950, 75, 1000, "#FF0000")
        }if (timer < 400){
            graphics.drawLine(90, 950, 90, 1000, "#FF0000")
        }if (timer < 300){
            graphics.drawLine(105, 950, 105, 1000, "#FF0000")
        }if (timer < 200){
            graphics.drawLine(120, 950, 120, 1000, "#FF0000")
        }if (timer < 100){
            graphics.drawLine(135, 950, 135, 1000, "#FF0000")
        }
    }

    //------------------------------------------------------------------
    //
    // This is the animation loop.
    //
    //------------------------------------------------------------------
    function animationLoop(time) {

        let elapsedTime = time - previousTime;
        previousTime = time;
        update(elapsedTime);
        render();

        requestAnimationFrame(animationLoop);
    }
    myKeyboard.registerCommand('d', rotateRight);
    myKeyboard.registerCommand('a', rotateLeft);
    myKeyboard.registerCommand('w', increaseSpeed);
    myKeyboard.registerCommand('s', decreaseSpeed);
    myKeyboard.registerCommand('r', reset);
    myKeyboard.registerCommand(' ', shoot);




    console.log('initializing...');
    requestAnimationFrame(animationLoop);



}(MySample.graphics, MySample.input));
