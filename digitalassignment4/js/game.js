let game;
let gameOptions = {
    firstPlatformPosition: 2 / 10,
    gameGravity: 1700,
    platformHorizontalSpeedRange: [250, 400],
    platformLengthRange: [120, 300],
    platformVerticalDistanceRange: [150, 250],
    platformHeight: 50
}
window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        backgroundColor:0x87ceea,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: "thegame",
            width: 750,
            height: 1334
        },
        physics: {
            default: "arcade",
            arcade: {
                gravity: {
                    y: gameOptions.gameGravity
                }
            }
        },
        scene: playGame
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
}
class playGame extends Phaser.Scene {
    constructor() {
        super("PlayGame");
    }
    preload() {
        this.load.image("hero", "hero.png");

        // pattern to fill the platform
        this.load.image("pattern", "pattern.png");

        // eyes image
        this.load.image("eyes", "eyes.png");

        // particle image, a 16x16 white square
        this.load.image("particle", "particle.png");
    }
    create() {

        // create a graphics game object and set it invisible
        this.borderGraphics = this.add.graphics();
        this.borderGraphics.setVisible(false);

        // create a big tile sprite and set it invisible
        this.pattern = this.add.tileSprite(game.config.width / 2, gameOptions.platformHeight / 2, game.config.width, gameOptions.platformHeight * 2, "pattern")
        this.pattern.setVisible(false);

        // create eyes sprite and set it invisible
        this.eyes = this.add.sprite(0, 0, "eyes");
        this.eyes.setVisible(false);
        this.platformGroup = this.physics.add.group();
        for (let i = 0; i < 10; i ++) {
            this.addPlatform(i == 0);
        }
        this.hero = this.physics.add.sprite(game.config.width / 2, 0, "hero");
        this.hero.setFrictionX(1);
        this.canDestroy = false;
        this.cameras.main.startFollow(this.hero, true, 0, 0.5, 0, - (game.config.height / 2 - game.config.height * gameOptions.firstPlatformPosition));
        this.input.on("pointerdown", this.destroyPlatform, this);

        // creation of the particle emitter
        this.emitter = this.add.particles("particle").createEmitter({

            // each particle starts at full scale and shrinks down until it disappears
            scale: {
                start: 1,
                end: 0
            },

            // each particle has a random speed from zero (no speed) to 200 pixels per second
            speed: {
                min: 0,
                max: 200
            },

            // the emitter is not active at the moment, this means no particles are emitted
            active: false,

            // each particle has a 500 milliseconds lifespan
            lifespan: 500,

            // the emitter can fire 50 particles simultaneously
            quantity: 50
        });
    }
    addPlatform(isFirstPlatform) {

        // platform is no longer a sprite but a renderTexture
        let platform = this.add.renderTexture(game.config.width / 2, isFirstPlatform ? game.config.width * gameOptions.firstPlatformPosition : 0, game.config.width / 8, gameOptions.platformHeight);

        // renderTexture does not have default origin at its center, so we set it manually
        platform.setOrigin(0.5)

        // renderTexture can't be created as a physics object on the fly so we add it to physics world manually
        this.physics.add.existing(platform);

        // add platform to platformGroup group
        this.platformGroup.add(platform);
        platform.isHeroOnIt = false;
        platform.body.setImmovable(true);
        platform.body.setAllowGravity(false);
        platform.body.setFrictionX(1);
        if(!isFirstPlatform) {
            this.positionPlatform(platform);
        }
        else {

            // method to draw inside the renderTexture
            this.drawPlatform(platform);
            platform.setTint(0x00ff00)

        }
        platform.assignedVelocityX = isFirstPlatform ? 0 : this.randomValue(gameOptions.platformHorizontalSpeedRange) * Phaser.Math.RND.sign();
    }

    // method to draw inside the renderTexture
    drawPlatform(platform) {

        // clear grahpics
        this.borderGraphics.clear();

        // set a line style
        this.borderGraphics.lineStyle(8, 0x000000, 1);

        // draw a rectangle with the same platform size
        this.borderGraphics.strokeRect(0, 0, platform.displayWidth, gameOptions.platformHeight);

        // draw the pattern inside the platform, with some randomization
        platform.draw(this.pattern, platform.displayWidth / 2, Phaser.Math.Between(0, gameOptions.platformHeight));

        // draw the eyes inside the platform, at is center
        platform.draw(this.eyes, platform.displayWidth / 2, platform.displayHeight / 2);

        // draw the graphics inside the platform
        platform.draw(this.borderGraphics);
    }
    paintSafePlatforms() {
        let floorPlatform = this.getHighestPlatform(0);
        floorPlatform.setTint(0xff0000);
        let targetPlatform = this.getHighestPlatform(floorPlatform.y);
        targetPlatform.setTint(0x00ff00);
    }
    handleCollision(hero, platform) {
        if (!platform.isHeroOnIt) {
            if (!platform.isTinted) {
                this.scene.start("PlayGame")
            }
            if (hero.x < platform.getBounds().left) {
                hero.setVelocityY(-200);
                hero.setVelocityX(-200);
                hero.angle = -45;
            }
            if (hero.x > platform.getBounds().right) {
                hero.setVelocityY(-200);
                hero.setVelocityX(200);
                hero.angle = 45;
            }
            platform.isHeroOnIt = true;
            this.paintSafePlatforms();
            this.canDestroy = true;
        }
    }
    randomValue(a) {
        return Phaser.Math.Between(a[0], a[1]);
    }
    destroyPlatform() {
        if (this.canDestroy) {
            this.canDestroy = false;
            let closestPlatform = this.physics.closest(this.hero).gameObject;

            // retrieve platform bounding box
            let platformBounds = closestPlatform.getBounds();

            // place particle emitter in the top left coordinate of the platform
            this.emitter.setPosition(platformBounds.left, platformBounds.top);

            // now the emitter is active
            this.emitter.active = true;

            // set a emit zone
            this.emitter.setEmitZone({

                // zone source is a rectangle with the same size as the platform
                source: new Phaser.Geom.Rectangle(0, 0, platformBounds.width, platformBounds.height),

                // place particles at random positions
                type: "random",

                // how many particles? 50
                quantity: 50
            });

            // explosion!
            this.emitter.explode();
            let furthestPlatform = this.physics.furthest(this.hero);
            closestPlatform.clearTint();
            closestPlatform.isHeroOnIt = false;
            closestPlatform.assignedVelocityX = this.randomValue(gameOptions.platformHorizontalSpeedRange) * Phaser.Math.RND.sign();
            this.positionPlatform(closestPlatform);

        }
    }
    getLowestPlatform() {
        let lowestPlatform = null;
        this.platformGroup.getChildren().forEach(function(platform) {
            lowestPlatform = Math.max(lowestPlatform, platform.y);
        });
        return lowestPlatform;
    }
    getHighestPlatform(maxHeight) {
        let highestPlatform = null;
        this.platformGroup.getChildren().forEach(function(platform) {
            if ((platform.y > maxHeight) && (!highestPlatform || platform.y < highestPlatform.y)) {
                highestPlatform = platform;
            }
        });
        return highestPlatform;
    }
    positionPlatform(platform) {
        platform.y = this.getLowestPlatform() + this.randomValue(gameOptions.platformVerticalDistanceRange);
        platform.x = game.config.width / 2;

        // we don't scale anymore the platform, but we set its size and its physics body size
        platform.setSize(this.randomValue(gameOptions.platformLengthRange), gameOptions.platformHeight);
        platform.body.setSize(platform.displayWidth, platform.displayHeight, true);

        // draw the platform
        this.drawPlatform(platform)
    }
    update() {
        if (this.hero.angle == 0) {
            this.physics.world.collide(this.hero, this.platformGroup, this.handleCollision, null, this);
        }
        this.platformGroup.getChildren().forEach(function(platform) {
            if (platform.y + game.config.height < this.hero.y) {
                this.scene.start("PlayGame")
            }
            let distance = Math.max(0.2, 1 - ((Math.abs(game.config.width / 2 - platform.x) / (game.config.width / 2)))) * Math.PI / 2;
            platform.body.setVelocityX(platform.assignedVelocityX * distance);
            if ((platform.body.velocity.x < 0 && platform.getBounds().left < this.hero.displayWidth / 2) || (platform.body.velocity.x > 0 && platform.getBounds().right > game.config.width - this.hero.displayWidth / 2)) {
                platform.assignedVelocityX *= -1;
            }
        }, this);
    }
}
