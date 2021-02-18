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

let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
const game = new Phaser.Game(config);

let player;
let cursors;
let bombs;
let scoreText;
let score = 0;
let hpText;
let hp = 100;
let difficulty = 0;
let spawnRate = 365;
let counter=0;
let gameOver = false;
let keyR;
let endGameText;
let oofSound;
let hpPots;
let squishSound;
let music;
let finalScore;
/*
let crosshair
let mouse;
let leftClick;
*/

function preload ()
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

}

function create(){
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
    this.physics.world.setBounds(0, 0, 800, 600);
    background.setOrigin(1, 1).setDisplaySize(800, 600);
    //player stuff
    player = this.physics.add.sprite(100,450, 'sokoban',52)
    player.setCollideWorldBounds(true);
    //The score text
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '40px', fill: '#fff' });
    //The lives text
    hpText = this.add.text(16, 64, 'HP: 100', { fontSize: '40px', fill: '#fff' });
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
    this.physics.add.collider(player, bombs, hitBomb, null, this);
    if(!gameOver){
        this.input.on('gameobjectdown', function (pointer, gameObject) {
            squishSound.play();
            gameObject.destroy();
            score+=25;
        });
    }

    //hp potions
    hpPots = this.physics.add.group();
    this.physics.add.collider(player, hpPots, getHp, null, this);
}


function update ()
{
    //always update score
    scoreText.setText('Score: ' + score);
    //game is over, player has option to restart
    if(gameOver){
        this.add.displayList.removeAll();
        endGameText = this.add.text(32,128, 'GAME OVER, Press R to retry', { fontSize: '46px', fill: '#fff' });
        finalScore = this.add.text(32,256, 'FINAL SCORE:'+ score, { fontSize: '46px', fill: '#fff' });
        if(keyR.isDown) {
            this.scene.restart();
            music.pause();
            spawnRate = 269 
            hp=100;
            score=0;
            gameOver = false;
            endGameText.destroy();
        }
    }
    let x = (player.x < 400) ? Phaser.Math.Between(100, 800) : Phaser.Math.Between(0, 500);
 
    //spawnrate increases based on player score
    if(score===50 && difficulty===0){
        spawnHp();
        spawnRate = 125
        difficulty=1;
    }
    else if(score===250&& difficulty===1){
        spawnHp();
        spawnRate = 90
        difficulty=2;
    }
    else if(score===500&& difficulty===2){
        spawnHp();
        spawnRate = 80
        difficulty=3;
    }
    else if(score===1000&& difficulty===3){
        spawnHp();
        spawnRate = 60
        difficulty=4;
    }
    else if(score===1500&& difficulty===4){
        spawnHp();
        spawnRate = 50
        difficulty=5;
    }
    else if(score===2000&& difficulty===5){
        spawnHp();
        spawnRate = 40;
        difficulty=6;
    }
    else if(score===2500&& difficulty===6){
        spawnHp();
        spawnRate = 35;
        difficulty=7;
    }
    else if(score>2500&& difficulty===7){
        spawnHp();
        spawnRate = 25;
        difficulty=8;
    }
    else if(difficulty==8){
        let x = Phaser.Math.Between(0, 100000000);
        spawnRate = 20;
        if(x<50000){
            spawnHp();
        }
    }

    // ensure spawnrate of bunnies is not overwhelming
    if(counter>=spawnRate){
        let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        let y = Phaser.Math.Between(0, 600);
        let bomb = bombs.create(x, y, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 30);
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
            player.setVelocity(-300,0);
            player.anims.play('left-walk', true);
        }
    else if (cursors.right.isDown)
        {
            player.setVelocity(300,0);
            player.anims.play('right-walk', true);
        }
    else if (cursors.up.isDown)
        {
            player.setVelocity(0,-300);
            player.anims.play('up-walk', true);
        }
    else if (cursors.down.isDown)
        {
            player.setVelocity(0,300);
            player.anims.play('down-walk', true);
        }
    else{
            player.setVelocity(0);
            player.anims.play('stop-walk', true);
            
        }
}

function hitBomb (player, bomb)
{
    oofSound.play();
    bomb.destroy();
    hp-=5;
    hpText.setText('HP: ' + hp);
    if(hp===0){
        this.physics.pause();
        gameOver = true;
        spawnRate=100000000000000000;
    }    
}

function spawnHp(){
    if(difficulty===3 || difficulty===4 || difficulty===5|| difficulty===6|| difficulty===7 || difficulty===8){
        let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        let y = Phaser.Math.Between(0, 600);
        let hpPot = hpPots.create(x, y, 'hpPot');
        hpPot.setCollideWorldBounds(true);
         hpPot.allowGravity = false;
    }

}

function getHp(player, hpPot){
    hp+=50;
    if(hp>150){
        hp=150;
    }
    hpText.setText('HP: ' + hp);
    hpPot.destroy();
}
