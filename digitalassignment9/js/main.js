import "./phaser.js";

class startScene extends Phaser.Scene{
    constructor(){
        super("bootGame");
    }
    preload(){
        this.load.image('button', 'assets/button.png');
    }
    create(){
          let button = this.physics.add.sprite(420,250, 'button');
          button.setInteractive();
          button.on('pointerdown', () => this.scene.start('PlayGame'));
          this.add.text(250,100, 'Click start to begin.', { fontSize: '28px', fill: '#fff' });
    }
}

let ball;
let target;
let music;
let walls;
let spaceKey;
let power=0;
let canShoot=false;
let centerPoint;
let gameOver=false;
let score=0;
let text; 
let buttonRestart;
let squares;
let distText;
let slider;
let movBall,movBall2,movBall3;

class playGame extends Phaser.Scene {
    constructor() {
        super("PlayGame");
    }
    
    preload() {
        this.load.image('ball','assets/ball.png');
        this.load.image('target','assets/target.png');
        this.load.audio('bgTrack', ['assets/BgTrack.mp3']);
        this.load.image('wall', 'assets/wall.png');
        this.load.html('nameform', 'assets/nameform.html');
        this.load.image('restart', 'assets/restart.png');
        this.load.image('centerpoint', 'assets/centerpoint.png');
        this.load.image('square', 'assets/square.png'); 
        this.load.image('bcircle', 'assets/badcircle.png'); 
    }
    
    create() {

        //controls
        spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        //objects (ball, target)
        ball = this.physics.add.sprite(269,500, 'ball');
        ball.setVisible(true);
        ball.setBounce(1);
        ball.setSize(27, 27, true);
        ball.depth=100;
        let randX = Phaser.Math.Between(88, 666);
        let randY =  Phaser.Math.Between(88, 444);
        target = this.physics.add.sprite(randX,randY, 'target');
        target.depth=0;
        this.physics.add.overlap(ball, target, this.ontarget, null, this);
        centerPoint = this.physics.add.sprite(randX,randY, 'centerpoint');
        centerPoint.setVisible(false);
        centerPoint.depth=0;
        centerPoint.setSize(8,8, true);

        //objects (obstacles)
        
        squares = this.physics.add.staticGroup();
        walls = this.physics.add.staticGroup();

        //randomized placement
        let i;
        for (i = 0; i < 7; i++) {
            let rX =  Phaser.Math.Between(88, 666);
            let rY =  Phaser.Math.Between(88, 550);
            squares.create(rX, rY, 'square').setCircle(15);
        }
        for (i = 0; i < 1; i++) {
            let rX =  Phaser.Math.Between(88, 666);
            let rY =  Phaser.Math.Between(330, 550);
            walls.create(rX, rY, 'wall').setScale(.8).refreshBody();
        }
        this.physics.add.collider(ball, squares);  
        this.physics.add.collider(ball, walls);  
        squares.setVisible(true);
        walls.setVisible(true);

        //sounds
        music = this.sound.add('bgTrack',{volume:.1});
        music.loop = true;
        music.play();

        //misc
        distText = this.add.text(20, 10, 'Distance to bulls-eye: 0', { color: 'white', fontSize: '20px '});
        distText.setVisible(false);
        let text = this.add.text(580, 10, 'Power level: 0', { color: 'white', fontSize: '20px '});
        let element = this.add.dom(600, -50).createFromCache('nameform');
        element.addListener('click');
        element.on('click', function (event) {
            if (event.target.name === 'playButton')
            {
                let inputText = this.getChildByName('nameField');
                //  Have they entered anything?
                if (inputText.value !== '')
                {
                    //  Turn off the click events
                    this.removeListener('click');
                    //  Hide the login element
                    this.setVisible(false);
                    //can shoot now
                    canShoot = true;
                    // powered up
                    power=inputText.value;
                    if(power>2000){
                        power=2000;
                        inputText.value=2000;
                    }
                    //  Populate the text with whatever they typed in
                    text.setText('Power level: ' + inputText.value);

                }
                else
                {
                    //  Flash the prompt
                    this.scene.tweens.add({
                        targets: text,
                        alpha: 0.2,
                        duration: 250,
                        ease: 'Power3',
                        yoyo: true
                    });
                }
            }

        });
        //animation at beginning
        this.tweens.add({
            targets: element,
            y: 570,
            duration: 1000,
            ease: 'Power3'
        });

        buttonRestart = this.physics.add.sprite(730,550, 'restart');
        buttonRestart.setVisible(false);
        buttonRestart.setSize(105, 53, true);
        buttonRestart.on('pointerdown', (pointer, targets) => {
             //clear stuff
            score=0;
            music.pause(); 
            buttonRestart.setVisible(false);
            text.setVisible(false);
            this.registry.destroy();
            this.events.off();
            this.scene.restart();
        });
    
        //movBalls use tweens to move in a set pattern
        movBall = this.physics.add.image(400, 320, 'bcircle')
        .setImmovable(true)
        .setVelocity(300, -300);
        movBall.setCircle(25);
        movBall.body.setAllowGravity(false);
        this.tweens.timeline({
            targets: movBall.body.velocity,
            loop: -1,
            tweens: [
              { x:    0, y: -200, duration: 1000, ease: 'Stepped' },
              { x:  150, y:  100, duration: 2000, ease: 'Stepped' },
              { x:    0, y: -200, duration: 1000, ease: 'Stepped' },
              { x: -150, y:  100, duration: 2000, ease: 'Stepped' }
            ]
          });
        this.physics.add.collider(movBall, ball);

        movBall2 = this.physics.add.image(400, 110, 'bcircle')
        .setImmovable(true)
        .setVelocity(300, -300);
        movBall2.setCircle(25);
        movBall2.body.setAllowGravity(false);
        this.tweens.timeline({
            targets: movBall2.body.velocity,
            loop: -1,
            tweens: [
              { x:    -200, y: 0, duration: 1000, ease: 'Stepped' },
              { x:  100, y:  150, duration: 2000, ease: 'Stepped' },
              { x:    -200, y: 0, duration: 1000, ease: 'Stepped' },
              { x: 100, y:  -150, duration: 2000, ease: 'Stepped' }
            ]
          });
        this.physics.add.collider(movBall2, ball);

        movBall3 = this.physics.add.image(400, 320, 'bcircle')
        .setImmovable(true)
        .setVelocity(300, -300);
        movBall3.setCircle(25);
        movBall3.body.setAllowGravity(false);
        this.tweens.timeline({
            targets: movBall3.body.velocity,
            loop: -1,
            tweens: [
              { x:    -200, y: -50, duration: 1000, ease: 'Stepped' },
              { x:  150, y:  -200, duration: 1200, ease: 'Stepped' },
              { x:    -100, y: 150, duration: 1000, ease: 'Stepped' },
              { x: 150, y:  100, duration: 1500, ease: 'Stepped' }
            ]
          });
        this.physics.add.collider(movBall3, ball);
    }

    ontarget(ob1,ob2){
       
        //might not use this (ball collides target)
        if (Math.abs(ball.body.velocity.x) < 1 && Math.abs(ball.body.velocity.y) < 1) {
            //calculate score here for bomus ball on target
            //let dist = Phaser.Math.Distance.BetweenPoints(ball, centerPoint);
            //console.log('distance: '+dist);
       }
    }

    calcScore(){
        //calculates score based on distance to center point
        if(gameOver){
            //calculate score here for bomus ball on target
            let dist = Phaser.Math.Distance.BetweenPoints(ball, centerPoint);
            dist=Math.round(dist);
            console.log('distance: '+dist);
            if(dist>=70 && dist<=90){
                score+=5;
            }
            else if(dist>=60 && dist<=70){
                score+=10;
            }
            else if(dist>=50 && dist<=60){
                score+=20;
            }
            else if(dist>=40 && dist<=50){
                score+=25;
            }
            else if(dist>=30 && dist<=40){
                score+=40;
            }
            else if(dist>=21 && dist<=30){
                score+=60;
            }
            else if(dist>=10 && dist<=21){
                score+=80;
            }
            else if(dist>=0 && dist<=10){
                score+=100;
            }
            gameOver=false;
            distText.setText('Distance to bulls-eye: '+dist);
            distText.setVisible(true);
        }

    }
    

    displayScore(delay){
        console.log('display score now')
        //display score
        text = this.add.text(20, 40, 'Score: '+score, { color: 'white', fontSize: '20px '});
        buttonRestart.setInteractive();
        buttonRestart.setVisible(true);     
        //return new Promise((resolve) => setTimeout(resolve, delay));
    }
    
    update() { 
     
        if(spaceKey.isDown && canShoot===true){
            ball.setVisible(true);
            ball.body.drag.set(120);
            ball.setCollideWorldBounds(true);
            this.physics.moveTo(ball,this.input.mousePointer.x,this.input.mousePointer.y,power);
            canShoot=false;
            console.log('power:' + power);
            console.log('shot!')
            gameOver=true;

            //make walls and squares visible.
            squares.setVisible(true);
        }
        if(!canShoot && gameOver){
            if (power===0 || (Math.abs(ball.body.velocity.x) < 1 && Math.abs(ball.body.velocity.y) < 1)) {
                this.calcScore();
                this.displayScore();
           }
        }

    }

   
}

let game;
    window.onload = function() {
        let gameConfig = {
            type: Phaser.AUTO,
            scale: {
                parent: "game",
                width: 800,
                height: 600
            },
            physics: {
                default: 'arcade',
                  arcade: {
                      debug: false,
                      gravity: {
                        x:0, y: 0
                      }
                  }
            },
            dom: {
                createContainer: true
            },
            scene: [startScene,playGame]
        }
        game = new Phaser.Game(gameConfig);
        window.focus();
}
    