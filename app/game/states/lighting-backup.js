/**
 * Created by philiplipman on 2/10/16.
 */
'use strict';

var light;
var bitmap;
//var lightBitmap;
//var walls;

function Lighting() {
};

Lighting.prototype = {
    preload: function () {
        var assetDirectory = 'app/game/assets/';
        var blockAsset = 'block.png';
        var lightAsset = 'light.png';
        this.load.image('block', assetDirectory + blockAsset);
        this.load.image('light', assetDirectory + lightAsset);

    },
    create: function () {
        this.game.stage.backgroundColor = 0x4488cc;

        this.light = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'light');
        this.light.anchor.setTo(0.5, 0.5);

        this.bitmap = this.game.add.bitmapData(this.game.width, this.game.height);
        this.bitmap.context.fillStyle = 'rgb(255, 255, 255)';
        this.bitmap.context.strokeStyle = 'rgb(255, 255, 255)';

        var lightBitmap = this.game.add.image(0, 0, this.bitmap);

        lightBitmap.blendMode = Phaser.blendModes.MULTIPLY;

        var NUMBER_OF_WALLS = 4;
        this.walls = this.game.add.group();
        var x, y;
        for(var i = 0; i < NUMBER_OF_WALLS; i++) {
            x = i * this.game.width/NUMBER_OF_WALLS + 50;
            y = this.game.rnd.integerInRange(50, this.game.height - 200);
            this.game.add.image(x, y, 'block', 0, this.walls).scale.setTo(3, 3);
        }

        this.game.input.activePointer.x = this.width / 2;
        this.game.input.activePointer.y = this.height / 2;
    },
    update: function () {
        this.light.x = this.game.input.activePointer.x;
        this.light.y = this.game.input.activePointer.y;

        this.bitmap.context.fillStyle = 'rgb(100, 100, 100)';
        this.bitmap.context.fillRect(0, 0, this.game.width, this.game.height);

        var points = [];
        //if (!(isNaN(this.light.x) || isNaN(this.light.y))) {

            for (var i = 0; i < Math.PI * 2; i += Math.PI / 360) {
                var x2 = this.light.x + Math.cos(i) * 1000;
                var y2 = this.light.y + Math.sin(i) * 1000;

                var ray = new Phaser.Line(this.light.x, this.light.y, x2, y2);

                //console.log(ray);
                var intersect = this.getWallIntersection(ray);

                if (intersect) {
                    points.push(intersect);
                } else {
                    points.push(ray.end);
                }
            }

            if (points.length > 0) {
                this.bitmap.context.beginPath();
                this.bitmap.context.fillStyle = 'rgb(255, 255, 255)';
                this.bitmap.context.moveTo(points[0].x, points[0].y);
                for (var i = 0; i < points.length; i++) {
                    this.bitmap.context.lineTo(points[i].x, points[i].y);
                }
                this.bitmap.context.closePath();
                this.bitmap.context.fill();

                this.bitmap.dirty = true;
            }
        //}
    },
    getWallIntersection: function (ray) {
        var distanceToWall = Number.POSITIVE_INFINITY;
        var closestIntersection = null;

        this.walls.forEach(function (wall) {
            var lines = [
                new Phaser.Line(wall.x, wall.y, wall.x + wall.width, wall.y),
                new Phaser.Line(wall.x, wall.y, wall.x, wall.y + wall.height),
                new Phaser.Line(wall.x + wall.width, wall.y,
                    wall.x + wall.width, wall.y + wall.height),
                new Phaser.Line(wall.x, wall.y + wall.height,
                    wall.x + wall.width, wall.y + wall.height)
            ];

            for (var i = 0; i < lines.length; i++) {
                var intersect = Phaser.Line.intersects(ray, lines[i]);

                if (intersect) {
                    var distance = this.game.math.distance(ray.start.x, ray.start.y, intersect.x, intersect.y);

                    if (distance < distanceToWall) {
                        distanceToWall = distance;
                        closestIntersection = intersect;
                    }
                }
            }

        }, this);

        return closestIntersection;
    }
};

module.exports = Lighting;
