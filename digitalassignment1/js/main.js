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

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
var lives;
var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var endText; 
var livesText;
var music;
var oofSound;
var game = new Phaser.Game(config);
var levelUp;
function preload ()
{
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/poison.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.audio('oof', [
        'assets/roblox.mp3'
    ]);
    this.load.audio('bgTrack', [
        'assets/bgTrack.mp3'
    ]);
    this.load.audio('levelup', [
        'assets/levelup.mp3'
    ]);
}

function create ()
{
    music = this.sound.add('bgTrack',{volume:0.69});
    music.loop = true;
    music.play();

    oofSound = this.sound.add('oof',{volume:0.69});
    levelUp = this.sound.add('levelup',{volume:0.69});
    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    //  Now let's create some ledges
    platforms.create(570, 369, 'ground').setScale(.4).refreshBody();
    platforms.create(50, 220, 'ground').setScale(.4).refreshBody();
    platforms.create(800, 220, 'ground').setScale(.4).refreshBody();
    platforms.create(420, 200, 'ground').setScale(.4).refreshBody();
    platforms.create(180, 400, 'ground').setScale(.4).refreshBody();

    // The player and its settings
    player = this.physics.add.sprite(100, 450, 'dude');

    //player start with 1 life
    lives = 1;
    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    //player.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    bombs = this.physics.add.group();

    //  The score
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#fff' });

    //The lives
    livesText = this.add.text(300, 16, 'Lives: 1', { fontSize: '32px', fill: '#fff' });

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, stars, collectStar, null, this);

    //hit poison pot
    this.physics.add.collider(player, bombs, hitBomb, null, this);
    this.physics.world.wrap(player);
}

function update ()
{

    if (gameOver)
    {
        endText = this.add.text(32, 32, 'GAME OVER', { fontSize: '96px', fill: '#fff' });
        return;
    }
    if(player.x < 0) 
    {
        player.x = 800
    }

    if(player.x > 800) 
    {
        player.x = 0
    }

    if(player.y > 700) 
    {
        player.y = 0
    }

    if(score>=200){
        if (cursors.left.isDown)
        {
            player.setVelocityX(-230);
    
            player.anims.play('left', true);
        }
        else if (cursors.right.isDown)
        {
            player.setVelocityX(230);
    
            player.anims.play('right', true);
        }
        else
        {
            player.setVelocityX(0);
    
            player.anims.play('turn');
        }
    
        if (cursors.up.isDown && player.body.touching.down)
        {
            player.setVelocityY(-360);
        }
    }
    else if(score>=500){
        if (cursors.left.isDown)
        {
            player.setVelocityX(-300);
    
            player.anims.play('left', true);
        }
        else if (cursors.right.isDown)
        {
            player.setVelocityX(300);
    
            player.anims.play('right', true);
        }
        else
        {
            player.setVelocityX(0);
    
            player.anims.play('turn');
        }
    
        if (cursors.up.isDown && player.body.touching.down)
        {
            player.setVelocityY(-390);
        }
    }
    else if(score>=1000){
        if (cursors.left.isDown)
        {
            player.setVelocityX(-360);
    
            player.anims.play('left', true);
        }
        else if (cursors.right.isDown)
        {
            player.setVelocityX(360);
    
            player.anims.play('right', true);
        }
        else
        {
            player.setVelocityX(0);
    
            player.anims.play('turn');
        }
    
        if (cursors.up.isDown && player.body.touching.down)
        {
            player.setVelocityY(-420);
        }

    }
    else{
        if (cursors.left.isDown)
        {
            player.setVelocityX(-190);
    
            player.anims.play('left', true);
        }
        else if (cursors.right.isDown)
        {
            player.setVelocityX(190);
    
            player.anims.play('right', true);
        }
        else
        {
            player.setVelocityX(0);
    
            player.anims.play('turn');
        }
    
        if (cursors.up.isDown && player.body.touching.down)
        {
            player.setVelocityY(-330);
        }
    }
}

function collectStar (player, star)
{
    star.disableBody(true, true);
    player.clearTint();

    if(score==0){
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
    }
    //  Add and update the score
    score += 10;
    scoreText.setText('Score: ' + score);



    if (stars.countActive(true) === 0)
    {
        levelUp.play();
        //  A new batch of stars to collect
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
    }
    if(score >= 50 && lives==1){
        lives++;
        livesText.setText('Lives: ' + lives);
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        var bomb = bombs.create(x, 10, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
    }
    if(score == 200 && lives>=1){
        livesText.setText('Lives: ' + lives);
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
    }
    if(score == 400 && lives>=1){
        lives++;
        livesText.setText('Lives: ' + lives);
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    }
    if(score == 600 && lives>=1){
        lives++;
        livesText.setText('Lives: ' + lives);
    }
    if(score == 800 && lives>=1){
        lives++;
        livesText.setText('Lives: ' + lives);
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
        bomb.setTint(0xff0000);
    }
    if(score == 1000 && lives>=1){
        lives++;
        livesText.setText('Lives: ' + lives);
    }
    if(score == 1200 && lives>=1){
        lives++;
        livesText.setText('Lives: ' + lives);
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
        bomb.setTint(0xff0000);
    }
    if(score == 1400 && lives>=1){
        lives++;
        livesText.setText('Lives: ' + lives);
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
    }

}

function hitBomb (player, bomb)
{
    oofSound.play();
    bomb.destroy();
    player.setTint(0xff0000);
    player.anims.play('turn');
    lives--;
    livesText.setText('Lives: ' + lives);
    if(lives==0){
        this.physics.pause();
        gameOver = true;
    }
    //player.clearTint();
    
}