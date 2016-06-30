function SpaceShooter() {
    this.player;
    this.starfield;
    this.input;
    this.facingRight = false;
    this.acceleration = 800;
    this.drag = 1000;
    this.maxSpeed = 400;
    this.shipTrail;
    this.bullets;
    this.fireRate = 200;
    this.nextFire = 0;
    this.baddies;
    this.blueBaddies;

    this.explosions;
    this.shields;
    this.baddiesLaunchTimer;
    this.blueBaddiesLaunchTimer;
    this.gameOver;
    this.fireButton;
    this.blueEnemyBullets;
}

//var fireButton = Phaser.Keyboard.SPACEBAR;

//var player;
//var target;
//var bullets;
//var map;
//var layer;
//var fireRate = 110;
//var nextFire = 0;

SpaceShooter.prototype = {
    preload() {

    },
    create() {
        var that = this;
        var game = that.game;

        that.fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        that.input = game.input.keyboard;
        that.starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

        var player = game.add.sprite(200, 300, 'dude');
        player.anchor.setTo(0.5, 0.5);
        player.health = 100;
        game.physics.enable(player, Phaser.Physics.ARCADE, false);
        player.body.maxVelocity.setTo(that.maxSpeed, that.maxSpeed);
        player.body.drag.setTo(that.drag, that.drag);
        player.body.collideWorldBounds = true;
        if (!that.facingRight) {
            player.scale.x *= -1;
            that.facingRight = !that.facingRight;
        }

        var shipTrail = game.add.emitter(player.x - 30, player.y, 400);
        shipTrail.width = 5;
        shipTrail.makeParticles('blue');
        shipTrail.setXSpeed(-200, -400);
        //shipTrail.setYSpeed(30, 30);
        shipTrail.setAlpha(1, 0.0, 800);
        shipTrail.setScale(0.2, 0.6, 0.2, 0.6);
        shipTrail.gravity = 100;
        shipTrail.start(false, 5000, 10);

        player.events.onKilled.add(function () {
            shipTrail.kill();
        });
        player.events.onRevived.add(function () {
            shipTrail.start(false, 5000, 10);

        });

        var bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;
        bullets.createMultiple(200, 'bullet');
        bullets.setAll('autoCull', true);
        bullets.setAll('checkWorldBounds', true);
        bullets.setAll('outOfBoundsKill', true);
        //bullets.setAll('anchor.x', 0.5);
        //bullets.setAll('anchor.y', 0.5);

        var enemyBullets = game.add.group();
        enemyBullets.enableBody = true;
        enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
        enemyBullets.createMultiple(30, 'bullet');
        enemyBullets.setAll('autoCull', true);
        enemyBullets.setAll('checkWorldBounds', true);
        enemyBullets.setAll('outOfBoundsKill', true);
        enemyBullets.setAll('tint', 0xff0000);

        // Standard enemy
        var baddies = game.add.group();
        baddies.enableBody = true;
        baddies.physicsBodyType = Phaser.Physics.ARCADE;
        baddies.createMultiple(5, 'baddie');
        //baddies.setAll('checkWorldBounds', true);
        //baddies.setAll('outOfBoundsKill', true);
        baddies.setAll('anchor.x', 0.5);
        baddies.setAll('anchor.y', 0.5);
        baddies.forEach(function (enemy) {
            that.addEnemyEmitterTrail(enemy);
            enemy.damageAmount = 20;
            enemy.events.onKilled.add(function () {
                enemy.trail.kill();
            });
        });
        // Standard enemy

        // Blue enemy
        var blueBaddies = game.add.group();
        blueBaddies.enableBody = true;
        blueBaddies.physicsBodyType = Phaser.Physics.ARCADE;
        blueBaddies.createMultiple(30, 'baddie');
        blueBaddies.setAll('tint', 0xff0000);
        //baddies.setAll('checkWorldBounds', true);
        //baddies.setAll('outOfBoundsKill', true);
        blueBaddies.setAll('anchor.x', 0.5);
        blueBaddies.setAll('anchor.y', 0.5);
        blueBaddies.forEach(function (enemy) {
            enemy.damageAmount = 40;
        });

        // Blue enemy


        var explosions = game.add.group();
        explosions.enableBody = true;
        explosions.physicsBodyType = Phaser.Physics.ARCADE;
        explosions.createMultiple(30, 'explosion');
        explosions.setAll('anchor.x', 0.5);
        explosions.setAll('anchor.y', 0.5);
        explosions.forEach(function (explosion) {
            explosion.animations.add('explosion');
        })

        var shields = game.add.text(game.world.width - 150, 10, 'Shields: ' + player.health + '%', {
            font: '20px Arial',
            fill: '#fff'
        });
        shields.render = function () {
            shields.text = 'Shields: ' + Math.max(player.health, 0) + '%';
        };


        //  Game over text
        var gameOver = game.add.text(game.world.centerX, game.world.centerY, 'GAME OVER!', {
            font: '84px Arial',
            fill: '#fff'
        });
        gameOver.anchor.setTo(0.5, 0.5);
        gameOver.visible = false;

        that.player = player;
        that.shipTrail = shipTrail;
        that.bullets = bullets;
        that.baddies = baddies;
        that.blueBaddies = blueBaddies;
        that.explosions = explosions;
        that.shields = shields;
        that.gameOver = gameOver;

        that.blueEnemyBullets = enemyBullets;

        game.time.events.add(1000, that.launchBaddie, that);
        game.time.events.add(1000, that.launchBlueBaddie, that);
    },
    update() {

        // Collisions
        this.physics.arcade.overlap(this.player, this.baddies, this.playerCollision, null, this);
        this.physics.arcade.overlap(this.bullets, this.baddies, this.bulletCollision, null, this);

        this.physics.arcade.overlap(this.player, this.blueBaddies, this.playerCollision, null, this);
        this.physics.arcade.overlap(this.bullets, this.blueBaddies, this.bulletCollision, null, this);

        this.physics.arcade.overlap(this.blueEnemyBullets, this.player, this.enemyHitsPlayer, null, this);


        this.starfield.tilePosition.x -= 2;
        this.shipTrail.x = this.player.x - 30;
        this.shipTrail.y = this.player.y;
        this.shipTrail.zIndex = this.player.zIndex - 10;
        this.controls();
        if (!this.player.alive) {
            this.gameOverNotification();
        }


    },
    enemyHitsPlayer(player, bullet) {
        var explosion = this.explosions.getFirstExists(false);
        explosion.reset(player.body.x + player.body.halfWidth, player.body.y + player.body.halfHeight);
        explosion.alpha = 0.7;
        explosion.play('explosion', 30, false, true);
        bullet.kill();
        player.damage(bullet.damageAmount);
        this.shields.render();
    },
    render() {
        var that = this;
        var debug = false;

        if(debug) {
            for (var i = 0; i < this.baddies.length; i++) {
                that.game.debug.body(this.baddies.children[i]);
            }

            for (var i = 0; i < this.blueBaddies.length; i++) {
                that.game.debug.body(this.blueBaddies.children[i]);
            }

            that.game.debug.body(this.player);
        }
    },
    gameOverNotification() {
        var that = this;
        var game = that.game;
        var player = that.player;
        var gameOver = that.gameOver;
        var fireButton = that.fireButton;
        if (!player.alive && gameOver.visible === false) {

            gameOver.visible = true;
            that.baddies.callAll('kill');
            that.blueBaddies.callAll('kill');
            that.blueEnemyBullets.callAll('kill');
            game.time.events.remove(that.baddiesLaunchTimer, that);
            game.time.events.remove(that.blueBaddiesLaunchTimer, that);

            //function setResetHandlers() {
            //    var spaceRestart = fireButton.onDown.addOnce(_restart, this);
            //    function _restart() {
            //        spaceRestart.detach();
            //        that.restart();
            //    }
            //}
            var fadeInGameOver = game.add.tween(gameOver);
            fadeInGameOver.to({alpha: 1}, 1000, Phaser.Easing.Quintic.Out);
            //fadeInGameOver.onComplete.add(setResetHandlers, this);
            fadeInGameOver.start;
        }

    },
    bulletCollision(bullet, enemy) {
        var explosion = this.explosions.getFirstExists(false);
        explosion.reset(enemy.body.x + enemy.body.halfWidth, enemy.body.y + enemy.body.halfHeight);
        explosion.body.velocity.y = enemy.body.velocity.y;
        explosion.alpha = 0.7;
        explosion.play('explosion', 30, false, true);
        enemy.kill();
        bullet.kill();
    },
    playerCollision(player, enemy) {
        var explosion = this.explosions.getFirstExists(false);
        explosion.reset(enemy.body.x + enemy.body.halfWidth, enemy.body.y + enemy.body.halfHeight);
        explosion.body.velocity.y = enemy.body.velocity.y;
        explosion.alpha = 0.7;
        explosion.play('explosion', 30, false, true);
        enemy.kill();

        player.damage(enemy.damageAmount);
        this.shields.render();
    },
    fire() {
        var time = this.time;
        var bullets = this.bullets;
        var nextFire = this.nextFire;
        var fireRate = this.fireRate;
        var player = this.player;

        if (time.now > nextFire && bullets.countDead() > 0) {
            nextFire = time.now + fireRate;
            var bullet = bullets.getFirstDead();
            bullet.reset(player.x + 16, player.y);
            bullet.body.velocity.x = 600;
        }

        this.nextFire = nextFire;
    },
    launchBaddie() {
        var minEnemySpacing = 300;
        var maxEnemySpacing = 3000;
        var enemySpeed = 300;

        var that = this;

        var game = that.game;
        var enemy = that.baddies.getFirstExists(false);

        if (enemy) {
            enemy.reset(game.width, game.rnd.integerInRange(0, game.height));

            enemy.body.velocity.x = -enemySpeed;
            enemy.body.velocity.y = game.rnd.integerInRange(-300, 300);
            enemy.body.drag.y = 100;

            enemy.trail.start(false, 800, 1);

            enemy.update = function () {
                enemy.trail.x = enemy.x + 20;
                enemy.trail.y = enemy.y;

                if (enemy.x < -100) {
                    enemy.kill();
                }
            }
        }

        //game.time.events.add(game.rnd.integerInRange(minEnemySpacing, maxEnemySpacing), this.launchBaddie, this);
        that.baddiesLaunchTimer = game.time.events.add(game.rnd.integerInRange(minEnemySpacing, maxEnemySpacing), that.launchBaddie, that);
    },
    launchBlueBaddie() {
        var that = this;
        var game = that.game;
        var startingY = game.rnd.integerInRange(100, game.height - 100);
        var enemySpeed = 200;
        var spread = game.rnd.integerInRange(60, 300);
        var frequency = 70;
        var verticalSpacing = 70;
        var horizontalSpacing = 70;
        var numEnemiesInWave = 5;
        var timeBetweenWaves = 5000;
        var blueEnemyBullets = that.blueEnemyBullets;

        //  Launch wave
        for (var i = 0; i < numEnemiesInWave; i++) {
            var enemy = that.blueBaddies.getFirstExists(false);
            if (enemy) {

                var bulletSpeed = 400;
                var firingDelay = 2000;
                enemy.bullets = 1;
                enemy.lastShot = 0;
                //original
                //enemy.startingX = startingX;
                //enemy.reset(game.width / 2, -verticalSpacing * i);
                //enemy.body.velocity.y = verticalSpeed;

                enemy.startingY = startingY;
                enemy.reset(game.width + horizontalSpacing * i, game.height / 2);

                enemy.body.velocity.x = -enemySpeed;

                enemy.update = function () {
                    var thatEnemy = this;
                    thatEnemy.body.y = thatEnemy.startingY + Math.cos((thatEnemy.x) / frequency) * spread;

                    var enemyBullet = blueEnemyBullets.getFirstExists(false);
                    if (enemyBullet &&
                        thatEnemy.alive &&
                        thatEnemy.bullets &&
                        thatEnemy.x < game.width - 50 &&
                        game.time.now > firingDelay + thatEnemy.lastShot) {
                        thatEnemy.lastShot = game.time.now;
                        thatEnemy.bullets--;
                        enemyBullet.reset(thatEnemy.x, thatEnemy.y + thatEnemy.height / 2);
                        enemyBullet.damageAmount = thatEnemy.damageAmount;
                        var angle = game.physics.arcade.moveToObject(enemyBullet, that.player, bulletSpeed);
                        enemyBullet.angle = game.math.radToDeg(angle);
                    }

                    if (enemy.x < -100) {
                        enemy.kill();
                    }
                }
            }
            //if (enemy) {
            //    enemy.startingY = startingY;
            //    enemy.reset(game.width / 2, -verticalSpacing * i);
            //    enemy.body.velocity.y = enemySpeed;
            //
            //    //  Update function for each enemy
            //    enemy.update = function () {
            //        //  Wave movement
            //        this.body.x = this.startingX + Math.sin((this.y) / frequency) * spread;
            //
            //        //  Kill enemies once they go off screen
            //        if (this.x < -200) {
            //            this.kill();
            //            this.x = -20;
            //        }
            //    };
            //}
        }

        //  Send another wave soon
        that.blueBaddiesLaunchTimer = game.time.events.add(timeBetweenWaves, that.launchBlueBaddie, that);
    },
    addEnemyEmitterTrail(enemy) {
        var enemyTrail = this.game.add.emitter(enemy.x + 30, enemy.body.y, 400);
        enemyTrail.width = 5;
        enemyTrail.makeParticles('blue');
        enemyTrail.setXSpeed(200, 400);
        //shipTrail.setYSpeed(30, 30);
        enemyTrail.setAlpha(1, 0.0, 800);
        enemyTrail.setScale(0.2, 0.6, 0.2, 0.6);
        enemyTrail.gravity = 100;

        enemy.trail = enemyTrail;
    },
    controls() {

        var that = this;

        var player = that.player;
        var input = that.input;

        var left = Phaser.Keyboard.A;
        var right = Phaser.Keyboard.D;

        var up = Phaser.Keyboard.W;
        var down = Phaser.Keyboard.S;
        var fireButton = that.fireButton;

        player.body.acceleration.x = 0;
        player.body.acceleration.y = 0;

        if (player.alive) {
            if (input.isDown(left) && !input.isDown(right)) {
                player.body.acceleration.x = -this.acceleration;
            } else if (input.isDown(right) && !input.isDown(left)) {
                player.body.acceleration.x = this.acceleration;
            }

            if (input.isDown(up) && !input.isDown(down)) {
                player.body.acceleration.y = -this.acceleration;
            } else if (input.isDown(down) && !input.isDown(up)) {
                player.body.acceleration.y = this.acceleration;
            }

            if (fireButton.isDown) {
                that.fire();
            }
        }

        if (!player.alive && fireButton.isDown && that.gameOver.visible) {
            that.restart();
        }


    },
    restart () {
        //  Reset the enemies
        var that = this;
        var baddies = that.baddies;
        var blueBaddies = that.blueBaddies;
        var game = that.game;
        var player = that.player;
        var shields = that.shields;


        //  Revive the player
        that.gameOver.visible = false;
        console.log('restart');

        //setTimeout(function () {
        that.nextFire = that.time.now + that.fireRate + 1000;
        player.x = 200;
        player.y = 300;
        player.revive();
        player.health = 100;
        //    player.body.acceleration.x = 0;
        //    player.body.acceleration.y = 0;
        //
        shields.render();
        //    that.baddiesLaunchTimer = null;
        that.game.time.events.add(1000, that.launchBaddie, that);
        that.game.time.events.add(1000, that.launchBlueBaddie, that);
        //
        //}, 3000);


        //  Hide the text

    }
}

module.exports = SpaceShooter;