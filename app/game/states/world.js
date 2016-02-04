'use strict';

var player;
var target;
var bullets;
var map;
var layer;
var fireRate = 110;
var nextFire = 0;

function World(levels) {
}

World.prototype = {
    preload: function() {
        var assetDirectory = 'app/game/assets/';

        this.load.tilemap('testmap', assetDirectory + 'maps/test.csv', null, Phaser.Tilemap.CSV);
    },
    create: function() {
        map = this.add.tilemap('testmap',64,64);

        map.setCollision(0);
        layer = map.createLayer(0);

        layer.resizeWorld();
        layer.debug = true;
        var minX = map.layers[0].data[0].length;
        var maxY = 0;//map.layers[0].data.length;

        for (var y = 0; y < map.layers[0].data.length; y++) {
            for (var x = 0; x < map.layers[0].data[y].length; x++) {
                console.log('x: ' + x + ' y: ' + y + ' value: ' + map.layers[0].data[y][x].index);
                if (map.layers[0].data[y][x].index !== 0) {
                    if (x < minX) {
                        minX = x;
                    }
                    if (y > maxY) {
                        maxY = y;
                    }
                }
            }
        }

        console.log('x: ' + minX + ' y: ' + maxY);
        console.log(map.layers[0].data.length);
        console.log(map.layers[0].data[0].length);

        player = this.game.add.sprite(minX * 64 + 32, maxY * 64 + 32, 'dude');
        this.physics.arcade.enable(player);
        player.body.bounce.y = 0.0;
        player.body.gravity.y = 0;
        player.body.collidWorldBounds = true;
        player.anchor.setTo(0.5, 0.5);
        player.animations.add('left', [0, 1, 2, 3], 10, true);
        player.animations.add('right', [5, 6, 7, 8], 10, true);

        bullets = this.game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;
        bullets.createMultiple(200, 'bullet');
        bullets.setAll("autoCull", true);
        bullets.setAll('checkWorldBounds', true);
        bullets.setAll('outOfBoundsKill', true);

        target = this.game.add.sprite(32, this.game.world.height - 150, 'target');
        this.physics.arcade.enable(target);
        target.scale.setMagnitude(2);
        target.anchor.set(0.5, 0.5);
        target.inputEnabled = true;
        target.renderable = false;

        this.camera.follow(player);

    },
    update: function () {
        this.physics.arcade.collide(player, layer);

        player.body.velocity.x = 0;
        var angle = Phaser.Math.radToDeg(this.physics.arcade.angleToPointer(player));

        if (Phaser.Point.equals(player.body.velocity, new Phaser.Point(0, 0))) {
            player.animations.stop();
            player.frame = 4;
        }
        else {
            if ((angle > -90) && (angle < 90)) {
                player.animations.play('right');
            }
            else {
                player.animations.play('left');
            }
        }

        target.input.enabled = true;
        target.x = this.input.mousePointer.worldX;
        target.y = this.input.mousePointer.worldY;
        //console.log("test: " + this.game.physics.arcade.overlap(player, target));
        //console.log("angleToPointer: " + angle);
        //console.log("velocity: " + Phaser.Point.equals(player.body.velocity, new Phaser.Point(0, 0)));

        if (this.input.mousePointer.isDown) {
            this.fire();
            //  400 is the speed it will move towards the mouse
            this.physics.arcade.moveToPointer(player, 400);
            if (this.physics.arcade.overlap(player, target)) {
                player.body.velocity.setTo(0, 0);
            }
        }
        else {
            player.body.velocity.setTo(0, 0);
        }
    },
    fire: function() {
        if (this.time.now > nextFire && bullets.countDead() > 0) {
            nextFire = this.game.time.now + fireRate;
            var bullet = bullets.getFirstDead();
            bullet.reset(player.x - 16, player.y);
            this.physics.arcade.moveToPointer(bullet, 700);
        }

    }
}

module.exports = World;