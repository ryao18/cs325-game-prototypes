import "./phaser.js";

// You can copy-and-paste the code from any of the examples at https://examples.phaser.io here.
// You will need to change the `parent` parameter passed to `new Phaser.Game()` from
// `phaser-example` to `game`, which is the id of the HTML element where we
// want the game to go.
// The assets (and code) can be found at: https://github.com/photonstorm/phaser3-examples
// You will need to change the paths you pass to `this.load.image()` or any other
// loading functions to reflect where you are putting the assets.
// All loading functions will typically all be found inside `preload()`.

// The simplest class example: https://phaser.io/examples/v3/view/scenes/scene-from-es6-class

let game;
window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        //backgroundColor:0x09090a,
        //backgroundColor:0x87ceea,
        scale: {
            parent: "game",
            width: 800,
            height: 600
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
            }
        },
        scene: [startScene,playGame]
        //scene:playGame
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
}

let player;
let cursors;
let bombs;
let scoreText;
let score = 0;
let hpText;
let hp = 100;
let difficulty = 0;
let spawnRate = 269;
let counter=0;
let gameOver = false;
let keyR;
let endGameText;
let oofSound;
let hpPots;
let squishSound;
let music;
let finalScore;
let finalscoreVal;
let timer=0;
let interval=690;
let grasses;

// did end up implementing time stuff
let timelimit;
let timeinfo;

class startScene extends Phaser.Scene{
    constructor(){
        super("bootGame");
    }
    create(){
        setTimeout(() => {
            this.scene.start('PlayGame')
          }, 5000);
          this.add.text(32,100, 'Game will start in 5 seconds..', { fontSize: '28px', fill: '#fff' });
          this.add.text(32,200, 'Arrow keys to move, click bunnies to squish.', { fontSize: '28px', fill: '#fff' });
          this.add.text(32,300, 'Read gameplay/strategies for tips.', { fontSize: '28px', fill: '#fff' });
    }
}
/*
class endScene extends Phaser.Scene{
    constructor(){
        super("endScene");
    }
    create(){
        setTimeout(() => {
            this.scene.start('playGame')
          }, 5000);
          this.add.text(32,128, 'GAME OVER, Press R to retry', { fontSize: '46px', fill: '#fff' });
          this.add.text(32,256, 'FINAL SCORE:'+ finalscoreVal, { fontSize: '46px', fill: '#fff' });
    }
}*/

class playGame extends Phaser.Scene {
    constructor() {
        super("PlayGame");
    }
    preload ()
    {
        this.load.spritesheet('sokoban', 'assets/sokoban_tilesheet.png', {
            frameWidth: 64
        })
        this.load.image('ground', 'assets/grass.png');
        this.load.image('bomb', 'assets/poison.png');
        this.load.image('hpPot','assets/hpPot.png');
        this.load.audio('oofSound', ['assets/roblox.mp3']);
        this.load.audio('dmg', ['assets/dmg.wav']);
        this.load.image('crosshair', 'assets/crosshair.png');
        this.load.audio('bgTrack', ['assets/BgTrack.mp3']);
        this.load.image('tallGrass', 'assets/tallgrass.png');
    
    }
    
     create(){
        //sounds
        music = this.sound.add('bgTrack',{volume:1});
        music.loop = true;
        music.play();
        oofSound = this.sound.add('oofSound',{volume:0.89});
        squishSound = this.sound.add('dmg',{volume:0.35});
        //restart key
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        //world config
        let background = this.add.image(800, 600, 'ground');
        this.physics.world.setBounds(0, 24, 800, 600);
        background.setOrigin(1, 1).setDisplaySize(800, 600);
        //player stuff
        player = this.physics.add.sprite(100,450, 'sokoban',52)
        player.setCollideWorldBounds(true);
        //The score text
        scoreText = this.add.text(500, 4, 'score: '+score, { fontSize: '40px', fill: '#fff' });
        //The lives text
        hpText = this.add.text(16, 4, 'HP: '+hp, { fontSize: '40px', fill: '#fff' });
        //time limit text
        //timeinfo = this.add.text(16, 69, 'Time limit: '+timelimit, { fontSize: '35px', fill: '#fff' });
        //time limit
        //timelimit = this.time.addEvent({ delay: 6900, callback: gameOver, callbackScope: this,loop: true});
        //  Input Events
        cursors = this.input.keyboard.createCursorKeys();
    
        //crosshair stuff, not working....
        this.input.setDefaultCursor('url(assets/crosshair.png), pointer');
    
        //Player Animations
        this.anims.create({
            key: 'down-walk',
            frames: this.anims.generateFrameNumbers('sokoban', { start: 52, end: 54 }),
            frameRate: 10,
            repeat: -1
        })
    
        this.anims.create({
            key: 'up-walk',
            frames: this.anims.generateFrameNumbers('sokoban', { start: 55, end: 57 }),
            frameRate: 10,
            repeat: -1
        })
    
        this.anims.create({
            key: 'left-walk',
            frames: this.anims.generateFrameNumbers('sokoban', { start: 81, end: 83 }),
            frameRate: 10,
            repeat: -1
        })
    
        this.anims.create({
            key: 'right-walk',
            frames: this.anims.generateFrameNumbers('sokoban', { start: 78, end: 80 }),
            frameRate: 10,
            repeat: -1
        })
    
        this.anims.create({
            key: 'stop-walk',
            frames: this.anims.generateFrameNumbers('sokoban', { start: 52, end: 52 }),
            frameRate: 10,
            repeat: -1
        })
    
        //bunny stuff
        bombs = this.physics.add.group();
        //bunny hit player or vice versa
        this.physics.add.collider(player, bombs, this.hitBomb, null, this);
    
        this.input.on('gameobjectdown', function (pointer, gameObject) {
                squishSound.play();
                gameObject.destroy();
                score+=25;
            });
    
        //hp potions
        hpPots = this.physics.add.group();
        this.physics.add.collider(player, hpPots, this.getHp, null, this);
    
        //hp potions
        grasses = this.physics.add.group();
        this.physics.add.collider(player, grasses, this.getGrass, null, this);
    }
    
    
    update(){
        //always update score and timelimit
        scoreText.setText('Score: ' + score);
        //game is over, player has option to restart
        if(gameOver){
            this.add.displayList.removeAll();
            endGameText = this.add.text(32,128, 'GAME OVER, Press R to retry', { fontSize: '46px', fill: '#fff' });
            finalScore = this.add.text(32,256, 'FINAL SCORE:'+ finalscoreVal, { fontSize: '46px', fill: '#fff' });
            if(keyR.isDown) {  
                this.scene.restart();
                music.pause();
                spawnRate = 269 
                hp=100;
                score=0;
                gameOver = false;
                endGameText.destroy();
                finalScore.destroy();
            }
        }
    
        //spawn grass
        this.spawnGrass();
    
    
        //let x = (player.x < 400) ? Phaser.Math.Between(100, 800) : Phaser.Math.Between(0, 500);
        let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        let y = Phaser.Math.Between(0, 600);
        //spawnrate increases based on player score
        if(score===50 && difficulty===0){
            //this.spawnHp();
            spawnRate = 100
            difficulty=1;
        }
        else if(score===250&& difficulty===1){
            //this.spawnHp();
            spawnRate = 70
            difficulty=2;
        }
        else if(score===500&& difficulty===2){
            this.spawnHp();
            spawnRate = 69
            difficulty=3;
        }
        else if(score===1000&& difficulty===3){
            //this.spawnHp();
            spawnRate = 50
            difficulty=4;
        }
        else if(score===1500&& difficulty===4){
            this.spawnHp();
            spawnRate = 40
            difficulty=5;
        }
        else if(score===2000&& difficulty===5){
            //this.spawnHp();
            spawnRate = 30;
            difficulty=6;
        }
        else if(score===2500&& difficulty===6){
            this.spawnHp();
            spawnRate = 25;
            difficulty=7;
        }
        else if(score>2500&& difficulty===7){
            this.spawnHp();
            spawnRate = 22;
            difficulty=8;
        }
        else if(score>3000 &&difficulty==8){
            spawnRate=19;
            timer++;
            if(timer > interval) {
                timer = 0;
                this.spawnHp();
            }
        }
        else if(score>4000 &&difficulty==8){
            spawnRate=15;
            timer++;
            if(timer > interval) {
                timer = 0;
                this.spawnHp();
            }
        }
    
        // ensure spawnrate of bunnies is not overwhelming
        if(counter>=spawnRate){
            let bomb = bombs.create(x, y, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-369, 369), Phaser.Math.Between(-369, 369));
            bomb.allowGravity = false;
            bomb.setInteractive();
            bomb.setScale(1.5);
            counter = 0;
        }
        else{
            counter++;
        }
    
        //Controls
        if (cursors.left.isDown)
            {
                player.setVelocity(-400,0);
                player.anims.play('left-walk', true);
                Phaser.Utils.Array.Each(
                    bombs.getChildren(),
                    this.physics.moveToObject,
                    this.physics,
                    player, 120);
            }
        else if (cursors.right.isDown)
            {
                player.setVelocity(400,0);
                player.anims.play('right-walk', true);
                Phaser.Utils.Array.Each(
                    bombs.getChildren(),
                    this.physics.moveToObject,
                    this.physics,
                    player, 120);
            }
        else if (cursors.up.isDown)
            {
                player.setVelocity(0,-400);
                player.anims.play('up-walk', true);
                Phaser.Utils.Array.Each(
                    bombs.getChildren(),
                    this.physics.moveToObject,
                    this.physics,
                    player, 120);
            }
        else if (cursors.down.isDown)
            {
                player.setVelocity(0,400);
                player.anims.play('down-walk', true);
                Phaser.Utils.Array.Each(
                    bombs.getChildren(),
                    this.physics.moveToObject,
                    this.physics,
                    player, 120);
            }
        else{
                player.setVelocity(0);
                player.anims.play('stop-walk', true);
                
            }
    }
    
    hitBomb(player, bomb){
        oofSound.play();
        bomb.destroy();
        hp-=5;
        hpText.setText('HP: ' + hp);
        if(hp===0){
            finalscoreVal = score;
            this.physics.pause();
            gameOver = true;
            spawnRate=100000000000000000;
        }    
    
    }
    
    spawnHp(){
        if(difficulty===3 || difficulty===4 || difficulty===5|| difficulty===6|| difficulty===7 || difficulty>=8){
            let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
            let y = Phaser.Math.Between(0, 600);
            let hpPot = hpPots.create(x, y, 'hpPot');
            hpPot.setCollideWorldBounds(true);
             hpPot.allowGravity = false;
        }
    
    }
    
     getHp(player, hpPot){
        hp+=50;
        if(hp>150){
            hp=150;
        }
        hpText.setText('HP: ' + hp);
        hpPot.destroy();
    }
    
     spawnGrass(){
        //timeinfo.setText('Time limit: '+(Math.floor(6900 - timelimit.getElapsed()))/1000);
        let x = Phaser.Math.Between(0, 800);
        let y = Phaser.Math.Between(18, 600);
        /*
        if(timelimit.delay===6900){
            let kit = grasses.create(x, y, 'tallGrass');
            kit.setCollideWorldBounds(true);
            kit.allowGravity = false;
        }*/
        let kit = grasses.create(x, y, 'tallGrass');
        kit.setCollideWorldBounds(true);
        kit.allowGravity = false;
    
    }
    
     getGrass(player, grass){
        grass.destroy();
    }

}

