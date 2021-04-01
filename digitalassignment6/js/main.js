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
let button;
class startScene extends Phaser.Scene{
    constructor(){
        super("bootGame");
    }
    preload(){
        this.load.image('button', 'assets/button.png');
    }
    create(){
          button = this.physics.add.sprite(420,450, 'button',52);
          button.setInteractive();
          button.on('pointerdown', () => this.scene.start('PlayGame'));

          this.add.text(32,100, 'Click start to begin.', { fontSize: '28px', fill: '#fff' });
          this.add.text(32,200, 'Roll Dice to begin... aim of the game is to reach 100 points', { fontSize: '20px', fill: '#fff' });
          this.add.text(32,300, 'Read gameplay/strategies for instructions & tips.', { fontSize: '24px', fill: '#fff' });
    }
    actionOnClick () {
        this.scene.start('PlayGame');
    }
}

//game stuff
let maxScore=100;
let comp1Sum=0,comp2Sum=0,comp1Score=0,comp2Score=0;
let playerScore=0;
let comp1Dice1,comp1Dice2,comp1Dice3;
let comp2Dice1,comp2Dice2,comp2Dice3;
let playerDice1=0,playerDice2=0,playerDice3=0;
let playerSum=0;
let rollButton;
let attackButton1;
let attackButton2;
let healButton1;
let healButton2;

//text stuff
let playerDice1Text,playerDice2Text,playerDice3Text;
let playerSumText,comp1SumText,comp2SumText;
let playerScoreText;
let comp1ScoreText,comp2ScoreText;
let comp1MSG,comp2MSG;
let instructions;
let instructions2;
let roundnum;
let tempinstruct;
let buttoninstruct;
let buttoninstruct2;

//misc
let keyR;
let music;
let roundCount=0;
let restartButton;
let m1,m2,m3,m4;

class playGame extends Phaser.Scene {
    constructor() {
        super("PlayGame");
    }

    preload ()
    {
        this.load.image('rollButton', 'assets/rollButton.png');
        this.load.image('attack', 'assets/attack.png');
        this.load.image('heal', 'assets/heal.png');
        this.load.audio('bgTrack', ['assets/BgTrack.mp3']);
        this.load.image('restartButton', 'assets/restart.png');
    }

    create(){

        //sounds
        music = this.sound.add('bgTrack',{volume:.05});
        music.loop = true;
        music.play();

        rollButton = this.physics.add.sprite(375,500, 'rollButton',52);
        rollButton.setInteractive();
        rollButton.on('pointerdown', () => this.roll() );
        rollButton.setVisible(true);

        attackButton1 = this.physics.add.sprite(450,240, 'attack',52);
        attackButton1.on('pointerdown', () => this.attack1() );
        attackButton2 = this.physics.add.sprite(450,350, 'attack',52);
        attackButton2.on('pointerdown', () => this.attack2() );
        healButton1 = this.physics.add.sprite(550,240, 'heal',52);
        healButton1.on('pointerdown', () => this.heal1() );
        healButton2 = this.physics.add.sprite(550,350, 'heal',52);
        healButton2.on('pointerdown', () => this.heal2() );
        healButton1.setVisible(false);
        healButton2.setVisible(false);
        attackButton1.setVisible(false);
        attackButton2.setVisible(false);

        playerSumText = this.add.text(30, 120, 'Player Sum: '+playerSum, { fontSize: '24px', fill: '#fcc203', visible: true });
        playerDice1Text = this.add.text(30, 150, 'Dice 1: '+playerDice1, { fontSize: '20px', fill: '#fff', visible: true});
        playerDice2Text = this.add.text(30, 180, 'Dice 2: '+playerDice2, { fontSize: '20px', fill: '#fff', visible: true });
        playerDice3Text = this.add.text(30, 210, 'Dice 3: '+playerDice3, { fontSize: '20px', fill: '#fff' , visible: true});
        playerScoreText = this.add.text(5, 4, 'Player Score: '+playerScore, { fontSize: '24px', fill: '#fcc203' , visible: true});

        comp1SumText = this.add.text(400, 180, 'Comp1 Sum: '+comp1Sum, { fontSize: '24px', fill: '#b4cabf', visible: true });
        comp2SumText = this.add.text(400, 300, 'Comp2 Sum: '+comp2Sum, { fontSize: '24px', fill: '#f86d86', visible: true });       
        comp1ScoreText = this.add.text(550, 4, 'Comp1 Score: '+comp1Score, { fontSize: '22px', fill: '#b4cabf', visible: true });
        comp2ScoreText = this.add.text(550, 42, 'Comp2 Score: '+comp2Score, { fontSize: '22px', fill: '#f86d86' , visible: true});

        comp1MSG = this.add.text(320, 150, 'Comp1 status: ', { fontSize: '22px', fill: '#fff' , visible: true});
        comp2MSG = this.add.text(320, 270, 'Comp2 status: ', { fontSize: '22px', fill: '#fff', visible: true });

        instructions = this.add.text(30, 370, 'If player sum is 6,8,10,12,14 can ATTACK others', { fontSize: '20px', fill: '#eb4034' });
        instructions2 = this.add.text(30, 400, 'If player sum is <6 or >15 can HEAL others', { fontSize: '20px', fill: '#34eb4c' });
        tempinstruct = this.add.text(30, 480, 'Press Roll to play ->', { fontSize: '20px', fill: '#fff' });
        buttoninstruct = this.add.text(150, 210, 'attack/heal buttons will show up here ->', { fontSize: '16px', fill: '#fff' });
        buttoninstruct2 = this.add.text(150, 320, 'attack/heal buttons will show up here ->', { fontSize: '16px', fill: '#fff' });

        roundnum = this.add.text(300, 50, 'Round: 0', { fontSize: '32px', fill: '#fff' });


        //restart stuff
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        /*
        restartButton = this.physics.add.sprite(420,360, 'restartButton',52);
        restartButton.setInteractive();
        restartButton.on('pointerdown', () => this.scene.restart());
        restartButton.setVisible(false);
        */
    }

    update(){
        playerScoreText.setText('Player Score: ' + playerScore);
        comp1ScoreText.setText('Comp1 Score: '+ comp1Score);
        comp2ScoreText.setText('Comp2 Score: ' + comp2Score);
        //game over, someone won
        if(playerScore>=maxScore||comp1Score>=maxScore||comp2Score>=maxScore){
            playerDice1Text.setVisible(false);
            playerDice2Text.setVisible(false);
            playerDice3Text.setVisible(false);
            playerSumText.setVisible(false);
            comp1SumText.setVisible(false);
            comp2SumText.setVisible(false);
            playerScoreText.setVisible(false);
            comp1ScoreText.setVisible(false);
            comp2ScoreText.setVisible(false);
            comp1MSG.setVisible(false);
            comp2MSG.setVisible(false);
            instructions.setVisible(false);
            instructions2.setVisible(false);
            roundnum.setVisible(false);
            tempinstruct.setVisible(false);
            rollButton.setVisible(false);
            attackButton1.setVisible(false);
            attackButton2.setVisible(false);
            healButton1.setVisible(false);
            healButton2.setVisible(false);
            //restartButton.setVisible(true);

            if(playerScore>=100){
                //player wins
                m1=this.add.text(100,100, 'PLAYER WINS', { fontSize: '36px', fill: '#fff' });
                //m1.destroy();
            }
            else if(comp1Score>=100){
                //comp1 wins
                m2=this.add.text(100,100, 'COMP1 WINS', { fontSize: '36px', fill: '#fff' });
                
            }
            else if(comp2Score>=100){
                //comp2 wins
                m3=this.add.text(100,100, 'COMP2 WINS', { fontSize: '36px', fill: '#fff' });
               
            }
            m4=this.add.text(100,160, 'Press R to play again.', { fontSize: '40px', fill: '#fff' });
            if(keyR.isDown) {  
                music.pause();
                m4.destroy();
                roundCount=0;
                comp1Sum=0,comp2Sum=0,comp1Score=0,comp2Score=0;
                playerScore=0;
                comp1Dice1,comp1Dice2,comp1Dice3;
                comp2Dice1,comp2Dice2,comp2Dice3;
                playerDice1=0,playerDice2=0,playerDice3=0;
                playerSum=0;
                this.scene.restart();
            }
   
        }
    }
    
    roll(){
        buttoninstruct.destroy();
        buttoninstruct2.destroy();
        instructions.destroy();
        instructions2.destroy();
        tempinstruct.destroy();
        roundCount++;
        roundnum.setText('Round: '+roundCount);
        rollButton.setInteractive(false);
        playerDice1 = Phaser.Math.Between(1, 6);
        playerDice2 = Phaser.Math.Between(1, 6);
        playerDice3 = Phaser.Math.Between(1, 6);
        playerSum = playerDice1 + playerDice2 + playerDice3;
        playerDice1Text.setText('Dice 1: '+playerDice1);
        playerDice2Text.setText('Dice 2: '+playerDice2);
        playerDice3Text.setText('Dice 3: '+playerDice3);
        playerSumText.setText('Player Sum: ' + playerSum);

        comp1Dice1 = Phaser.Math.Between(1, 6);
        comp1Dice2 = Phaser.Math.Between(1, 6);
        comp1Dice3 = Phaser.Math.Between(1, 6);
        comp1Sum = comp1Dice1 + comp1Dice2 + comp1Dice3;
        comp1SumText.setText('Comp1 Sum: ' + comp1Sum);

        comp2Dice1 = Phaser.Math.Between(1, 6);
        comp2Dice2 = Phaser.Math.Between(1, 6);
        comp2Dice3 = Phaser.Math.Between(1, 6);
        comp2Sum =  comp2Dice1 + comp2Dice2 + comp2Dice3;
        comp2SumText.setText('Comp2 Sum: ' + comp2Sum);

        let rand = Phaser.Math.Between(1, 2);
        //player can attack
        if(playerSum===6||playerSum===8||playerSum===10||playerSum===12||playerSum===14){
            attackButton1.setInteractive();
            attackButton2.setInteractive();
            attackButton1.setVisible(true);
            attackButton2.setVisible(true);
            healButton1.setVisible(false);
            healButton2.setVisible(false);
        }
        //player - just add to score
        if(playerSum===7||playerSum===9||playerSum===11||playerSum===13||playerSum===15){
            playerScore+=playerSum;
            healButton1.setVisible(false);
            healButton2.setVisible(false);
            attackButton1.setVisible(false);
            attackButton2.setVisible(false);
        }
        //player can heal other
        if(playerSum<6 || playerSum>15){
            healButton1.setInteractive();
            healButton2.setInteractive();
            healButton1.setVisible(true);
            healButton2.setVisible(true);
            attackButton1.setVisible(false);
            attackButton2.setVisible(false);
        }
        
        //comp1 can attack
        if(comp1Sum===6||comp1Sum===8||comp1Sum===10||comp1Sum===12||comp1Sum===14){
            //attack player
            if(rand===1){
                comp1MSG.setText('Comp1 attacked Player for '+(comp1Sum/2)+' Points');
                playerScore-=(comp1Sum/2);
                if(playerScore<0){
                    playerScore=0;
                }
            }
            //attack other comp
            else{
                comp1MSG.setText('Comp1 attacked Comp2 for '+(comp1Sum/2)+' Points');
                comp2Score-=(comp1Sum/2);
                if(comp2Score<0){
                    comp2Score=0;
                }
            }
        }
        //comp1 - just add to score
        if(comp1Sum===7||comp1Sum===9||comp1Sum===11||comp1Sum===13||comp1Sum===15){
            if(comp1Sum===7){
                comp1MSG.setText('Comp1 status: afk');
            }
            if(comp1Sum===9){
                comp1MSG.setText('Comp1 status: lol u guys suck');
            }
            if(comp1Sum===11){
                comp1MSG.setText('Comp1 status: so ez');
            }
            if(comp1Sum===13){
                comp1MSG.setText('Comp1 status: go cri');
            }
            if(comp1Sum===15){
                comp1MSG.setText('Comp1 status: game is free');
            }
            comp1Score+=comp1Sum;
        }
        //comp1 can heal other
        if(comp1Sum<6 || comp1Sum>15){
            //heal player
            if(rand===1){
                comp1MSG.setText('Comp1 gave player '+(comp1Sum)+' Points');
                playerScore+=comp1Sum;
            }
            //heal other comp
            else{
                comp1MSG.setText('Comp1 gave comp2 '+(comp1Sum)+' Points');
                comp2Score+=comp1Sum;
            }
        }

        //comp2 can attack
        if(comp2Sum===6||comp2Sum===8||comp2Sum===10||comp2Sum===12||comp2Sum===14){
            //attack player
            if(rand===1){
                comp2MSG.setText('Comp2 attacked Player for '+(comp2Sum/2)+' Points');
                playerScore-=(comp2Sum/2);
                if(playerScore<0){
                    playerScore=0;
                }
            }
            //attack other comp
            else{
                comp2MSG.setText('Comp2 attacked Comp1 for '+(comp2Sum/2)+' Points');
                comp1Score-=(comp2Sum/2);
                if(comp1Score<0){
                    comp1Score=0;
                }
            }
        }
        //comp2 - just add to score
        if(comp2Sum===7||comp2Sum===9||comp2Sum===11||comp2Sum===13||comp2Sum===15){
            if(comp2Sum===7){
                comp2MSG.setText('Comp2 status: afk');
            }
            if(comp2Sum===9){
                comp2MSG.setText('Comp2 status: lol noobs');
            }
            if(comp2Sum===11){
                comp2MSG.setText('Comp2 status: ez');
            }
            if(comp2Sum===13){
                comp2MSG.setText('Comp2 status: zzzzzz');
            }
            if(comp2Sum===15){
                comp2MSG.setText('Comp2 status: ez game');
            }
            comp2Score+=comp2Sum;
        }
        //comp2 can heal other
        if(comp2Sum<6 || comp2Sum>15){
            //heal player
            if(rand===1){
                comp2MSG.setText('Comp2 gave Comp1 '+(comp2Sum)+' Points');
                playerScore+=comp2Sum;
            }
            //heal other comp
            else{
                comp2MSG.setText('Comp2 gave Comp1 '+(comp2Sum)+' Points');
                comp1Score+=comp2Sum;
            }
        }
        rollButton.setInteractive();

    }

    attack1(){
        comp1Score-=(playerSum/2);
        if(comp1Score<0){
            comp1Score=0;
        }
        attackButton1.setInteractive(false);
        attackButton1.setVisible(false);
        attackButton2.setInteractive(false);
        attackButton2.setVisible(false);
    }
    attack2(){
        comp2Score-=(playerSum/2);
        if(comp2Score<0){
            comp2Score=0;
        }
        attackButton1.setInteractive(false);
        attackButton1.setVisible(false);
        attackButton2.setInteractive(false);
        attackButton2.setVisible(false);
    }
    heal1(){
        comp1Score+=playerSum;
        healButton1.setInteractive(false);
        healButton1.setVisible(false);
        healButton2.setInteractive(false);
        healButton2.setVisible(false);
    }
    heal2(){
        comp2Score+=playerSum;
        healButton1.setInteractive(false);
        healButton1.setVisible(false);
        healButton2.setInteractive(false);
        healButton2.setVisible(false);
    }
}

/*
let restartButton;
//this is not working atm
class winScene1 extends Phaser.Scene{
    constructor(){
        super("game");
        //super();
    }
    preload(){
        this.load.image('restartButton', 'assets/restart.png');
    }
    create(){

        if(playerScore>=100){
            //player wins
            this.add.text(32,100, 'PLAYER WINS', { fontSize: '32px', fill: '#fff' });

        }
        else if(comp1Score>=100){
            //comp1 wins
            this.add.text(32,100, 'COMP1 WINS', { fontSize: '32px', fill: '#fff' });

        }
        else if(comp2Score>=100){
            //comp2 wins
            this.add.text(32,100, 'COMP2 WINS', { fontSize: '32px', fill: '#fff' });

        }
        restartButton = this.physics.add.sprite(420,360, 'restartButton',52);
        restartButton.setInteractive();
        restartButton.on('pointerdown', () => this.scene.start('PlayGame') );
          
    }
}
*/

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
                gravity: { y: 0 },
            }
        },
        scene: [startScene,playGame]
        //scene: [startScene,playGame,winScene1]
        //scene:playGame
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
}
