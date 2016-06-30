/**
 * Created by philiplipman on 1/29/16.
 */
'use strict';

var roomCount = 120;

var rooms = [];
var mainRooms = [];
var subRooms = [];
var hallRooms = [];
var edges = [];

var lines = [];
var sizeMultiplier = 1;

var padding = 200;
var minRoomArea = 6400;

// rng
//var seed = Date.now();

var seed = 12345;
var g = 16807;
var n = 2147483647;
var cursors;

// relative neighborhood graph
var drawGraph = false;

var graphFinished = false;
var tileSize = 16;

var map = [];

var finalMap = [];
var levels = [];
var mapLowX = 999999;

var mapHighX = 0;
var mapLowY = 999999;
var mapHighY = 0;
var lineTint = '#00FF00';

var roomTint = '#374140';
var subRoomTint = '#dc3522';
var mapArrayPadding = 3;

function GenerateDungeon() {
}

GenerateDungeon.prototype = {
    getLevels: function () {
        return this.mainLevels;
    },
    getInitialState: function() {
        return {
            mainLevels: []
        };
    },

    setActiveMenuItem: function(uid) {
        this.setState({mainLevels: levels});
    },

    preload: function () {
        var assetDirectory = 'app/game/assets/';

        var wallAsset = 'wall.png';
        var dudeAsset = 'dude.png';
        var diamondAsset = 'diamond.png';
        var starAsset = 'star.png';

        this.load.image('wall', assetDirectory + wallAsset);
        this.load.spritesheet('dude', assetDirectory + dudeAsset, 32, 48);
        this.load.spritesheet('target', assetDirectory + diamondAsset, 32, 28);
        this.load.image('bullet', assetDirectory + starAsset);

    },
    create: function () {
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.world.setBounds(0, 0, 1600, 1200);

        //this.add.sprite(0, 0, 'sky');

        this.generateRooms();

        cursors = this.input.keyboard.createCursorKeys();

    },
    update: function () {

        if (!this.separateRooms() && !graphFinished) {
            drawGraph = true;
        }

        if (drawGraph) {
            for (var i = 0; i < rooms.length; i++) {
                rooms[i].x = this.math.snapToFloor(rooms[i].x, tileSize);
                rooms[i].y = this.math.snapToFloor(rooms[i].y, tileSize);
            }

            this.mainRooms();
            this.relativeNeighborhoodGraph();

            for (var i = 0; i < edges.length; i++) {
                var a = edges[i][0];
                var b = edges[i][1];

                var roomA = mainRooms[a];
                var roomB = mainRooms[b];

                this.drawLine(roomA, roomB);
            }

            for (var i = 0; i < lines.length; i++) {
                lines[i].x = this.math.snapToFloor(lines[i].x, tileSize);
                lines[i].y = this.math.snapToFloor(lines[i].y, tileSize);
            }
            this.relativeNeighborhoodGraph();


            this.getSubRooms();
            graphFinished = true;
            drawGraph = false;

            this.createCollisionMap();
        }

        if (this.input.keyboard.isDown(Phaser.KeyCode.Q)) {
            console.log('q');
            this.game.state.start("main-menu", true, false);
        }

        if (cursors.up.isDown) {
            this.camera.y -= 4;

        } else if (cursors.down.isDown) {
            this.camera.y += 4;
        }

        if (cursors.left.isDown) {
            this.camera.x -= 4;
        } else if (cursors.right.isDown) {
            this.camera.x += 4;
        }
    },
    arrayToCsv: function (array, char, tint) {

        var width = [];
        var height = [];

        for (var i = 0; i < array.length; i++) {

            var x1 = array[i].x / tileSize;
            var x2 = (array[i].x + array[i].width) / tileSize;

            var y1 = array[i].y / tileSize;
            var y2 = (array[i].y + array[i].height) / tileSize;

            if (x1 >= 0 && x2 < map[0].length
                && y1 >= 0 && y2 < map.length) {

                if (x1 < mapLowX) {
                    mapLowX = x1;
                }

                if (x2 > mapHighX) {
                    mapHighX = x2;
                }

                if (y1 < mapLowY) {
                    mapLowY = y1;
                }

                if (y2 > mapHighY) {
                    mapHighY = y2;
                }

                for (var j = x1; j < x2; j++) {
                    for (var k = y1; k < y2; k++) {
                        map[k][j] = char;
                    }
                }
            }
        }
    },
    createCollisionMap: function () {
        var output = '';


        console.log('width: ' + (this.world.width / tileSize));
        console.log('height: ' + (this.world.height / tileSize));
        for (var i = 0; i < this.world.height / tileSize; i++) {
            var columns = Array.apply(null, Array(this.world.width / tileSize)).map(String.prototype.valueOf, '0');
            map[i] = (columns);
        }

        this.arrayToCsv(subRooms, 'S', subRoomTint);
        this.arrayToCsv(lines, 'H', lineTint);
        this.arrayToCsv(mainRooms, 'M', roomTint);


        if (mapLowX > mapArrayPadding) {
            mapLowX -= mapArrayPadding;
        }
        if (mapHighX < map[0].length - mapArrayPadding) {
            mapHighX += mapArrayPadding;
        }
        if (mapLowY > mapArrayPadding) {
            mapLowY -= mapArrayPadding;
        }
        if (mapHighY < map.length - 2) {
            mapHighY += mapArrayPadding;
        }

        for (var i = mapLowY; i < mapHighY; i++) {
            var rowMap = [];
            for (var j = mapLowX; j < mapHighX; j++) {
                rowMap.push(map[i][j]);
                output = output + map[i][j] + ',';
            }

            finalMap.push(rowMap);

            output += '\n';
        }

        levels.push(finalMap);

        this.mainLevels = levels;


        //console.log(this.mainLevels);
        //console.log('mapLowX: ' + mapLowX);
        //console.log('mapHighX: ' + mapHighX);
        //console.log('mapLowY: ' + mapLowY);
        //console.log('mapHighY: ' + mapHighY);

        console.log('output: ' + output);
        //console.log(finalMap);

    },
    getSubRooms: function () {
        for (var i = 0; i < rooms.length; i++) {
            for (var j = 0; j < lines.length; j++) {
                if (this.physics.arcade.overlap(rooms[i], lines[j])) {
                    if (rooms[i].width * rooms[i].height <= minRoomArea) {
                        rooms[i].tint = 0xdc3522;
                        subRooms.push(rooms[i]);
                    }
                }
            }
        }
    },
    generateRooms: function () {
        for (var i = 0; i < roomCount; i++) {

            var roomDimensions = new generateRoomDimensions(this.game);
            var room = this.add.tileSprite(roomDimensions.x(), roomDimensions.y(), roomDimensions.width(), roomDimensions.height(), 'wall', 1);

            this.physics.arcade.enable(room);
            room.body.collideWorldBounds = true;

            room.tint = 0x374140;

            rooms.push(room);
        }
    },
    mainRooms: function () {
        for (var i = 0; i < rooms.length; i++) {
            var room = rooms[i];
            if (room.width * room.height > minRoomArea) {
                room.tint = 0xdbc9ce;
                mainRooms.push(room);
            }
        }
    },
    relativeNeighborhoodGraph: function () {

        var getLength = mainRooms.length;

        for (var i = 0; i < getLength - 1; i++) {
            for (var j = i + 1; j < getLength; j++) {
                var skip = false;

                for (var k = 0; k < getLength; k++) {
                    if (k === i || k === j) {
                        continue;
                    }
                    var dij = this.physics.arcade.distanceBetween(mainRooms[i], mainRooms[j]);
                    var dik = this.physics.arcade.distanceBetween(mainRooms[i], mainRooms[k]);
                    var djk = this.physics.arcade.distanceBetween(mainRooms[j], mainRooms[k]);

                    if (dij >= Math.max(dik, djk)) {
                        skip = true;
                        break;
                    }
                }

                if (!skip) {
                    edges.push([i, j]);
                }
            }
        }
    },
    drawLine: function (outer, inner) {

        var hallSize = tileSize * 2;

        var roomA;
        var roomB;
        var dx;
        var dy;

        if (outer.centerX < inner.centerX) {
            roomA = outer;
            roomB = inner;
        } else {

            roomA = inner;
            roomB = outer;

        }

        var aCenterX = this.math.snapToFloor(roomA.x + roomA.width / 2, tileSize);
        var aCenterY = this.math.snapToFloor(roomA.y + roomA.height / 2, tileSize);

        var bCenterX = this.math.snapToFloor(roomB.x + roomB.width / 2, tileSize);
        var bCenterY = this.math.snapToFloor(roomB.y + roomB.height / 2, tileSize);

        dx = bCenterX - aCenterX;
        dy = bCenterY - aCenterY;

        var phaserLine;
        var phaserLine2;


        if (getRandomInt(0, 1) === 1) {
            if (dy > 0) {

                // phaserLine = new Phaser.Rectangle(roomA.centerX, roomA.centerY, dx, 8);
                // phaserLine2 = new Phaser.Rectangle(phaserLine.right, phaserLine.top, 8, dy);

                phaserLine = this.add.sprite(aCenterX - hallSize / 2, aCenterY - hallSize / 2, 'wall');
                phaserLine.width = dx;
                phaserLine.height = hallSize;
                phaserLine.tint = 0x00FF00;

                phaserLine2 = this.add.sprite(phaserLine.x + phaserLine.width, phaserLine.y, 'wall');
                phaserLine2.width = hallSize;
                phaserLine2.height = dy;
                phaserLine2.tint = 0x00FF00;

            } else {
                //// phaserLine = new Phaser.Rectangle(roomA.centerX, roomA.centerY, dx, 8);
                //// phaserLine2 = new Phaser.Rectangle(phaserLine.right, phaserLine.bottom, 8, dy);

                phaserLine = this.add.sprite(aCenterX - hallSize / 2, aCenterY - hallSize / 2, 'wall');
                phaserLine.width = dx;
                phaserLine.height = hallSize;
                phaserLine.tint = 0x00FF00;

                phaserLine2 = this.add.sprite(phaserLine.x + phaserLine.width, phaserLine.y + phaserLine.height, 'wall');
                phaserLine2.width = hallSize;
                phaserLine2.height = dy;
                phaserLine2.tint = 0x00FF00;

            }
        } else {
            if (dy > 0) {
                //// phaserLine2 = new Phaser.Rectangle(roomA.centerX, roomA.centerY, dx, 8);
                //// phaserLine = new Phaser.Rectangle(phaserLine2.right, phaserLine2.top, 8, dy);

                phaserLine2 = this.add.sprite(aCenterX - hallSize / 2, aCenterY - hallSize / 2, 'wall');
                phaserLine2.width = dx;
                phaserLine2.height = hallSize;
                phaserLine2.tint = 0x00FF00;

                phaserLine = this.add.sprite(phaserLine2.x + phaserLine2.width, phaserLine2.y, 'wall');
                phaserLine.width = hallSize;
                phaserLine.height = dy;
                phaserLine.tint = 0x00FF00;

            } else {
                //// phaserLine2 = new Phaser.Rectangle(roomA.centerX, roomA.centerY, dx, 8);
                //// phaserLine = new Phaser.Rectangle(phaserLine2.right, phaserLine2.bottom, 8, dy);

                phaserLine2 = this.add.sprite(aCenterX - hallSize / 2, aCenterY - hallSize / 2, 'wall');
                phaserLine2.width = dx;
                phaserLine2.height = hallSize;
                phaserLine2.tint = 0x00FF00;

                phaserLine = this.add.sprite(phaserLine2.x + phaserLine2.width, phaserLine2.y + phaserLine2.height, 'wall');
                phaserLine.width = hallSize;
                phaserLine.height = dy;
                phaserLine.tint = 0x00FF00;

            }
        }

        if (phaserLine.width < 0) {
            phaserLine.x += phaserLine.width;
            phaserLine.width *= -1;
        }
        if (phaserLine.height < 0) {
            phaserLine.y += phaserLine.height;
            phaserLine.height *= -1;
        }

        if (phaserLine2.width < 0) {
            phaserLine2.x += phaserLine2.width;
            phaserLine2.width *= -1;
        }
        if (phaserLine2.height < 0) {
            phaserLine2.y += phaserLine2.height;
            phaserLine2.height *= -1;
        }

        this.physics.arcade.enable(phaserLine);
        this.physics.arcade.enable(phaserLine2);

        lines.push(phaserLine);
        lines.push(phaserLine2);
    },

    separateRooms: function () {
        var separate = false;

        for (var i = 0; i < rooms.length; i++) {
            var roomA = rooms[i];

            var neighborCount = 0;
            var dx = 0;
            var dy = 0;

            for (var j = 0; j < rooms.length; j++) {
                if (i != j) {
                    var roomB = rooms[j];
                    if (this.physics.arcade.overlap(roomA, roomB, null, null, this)) {
                        dx = dx + Math.floor(roomA.x - roomB.x);
                        dy = dy + Math.floor(roomA.y - roomB.y);
                        neighborCount++;
                    }
                }
            }

            if (neighborCount !== 0) {
                separate = true;
                dx = dx / neighborCount;
                dy = dy / neighborCount;

                var c = Math.sqrt(dx * dx + dy * dy);

                var worldXCheck = roomA.x + dx / c;
                var worldXYCheck = roomA.y + dy / c;

                if (this.world.x < worldXCheck && this.world.x + this.world.width > worldXCheck) {
                    roomA.x += Math.round(dx / c);
                }
                if (this.world.y < worldXYCheck && this.world.y + this.world.height > worldXYCheck) {
                    roomA.y += Math.round(dy / c);
                }
            }
        }

        return separate;
    }
};
// TODO: pull this out into it's own object
function generateRoomDimensions(game) {
    var width;
    var height;

    var ratio = 0;
    var minRatio = 1.0;
    var maxRatio = 2.5;

    var minSideLength = 2;
    var maxSideLength = 7;

    while (ratio < minRatio || ratio > maxRatio) {
        width = getRandomInt(minSideLength, maxSideLength) * tileSize;
        height = getRandomInt(minSideLength, maxSideLength) * tileSize;

        if (width > height) {
            ratio = width / height;
        }
        else {
            ratio = height / width;
        }
    }

    this.x = function () {
        return getRandomInt(padding, game.world.width - this.width() - padding);
    };
    this.y = function () {
        return getRandomInt(padding, game.world.height - this.height() - padding);
    };

    this.width = function () {
        return width * sizeMultiplier;
    };
    this.height = function () {
        return height * sizeMultiplier;
    };

    this.area = function () {
        return this.width() * this.height();
    };

    this.ratio = function () {
        return ratio;
    };

}

// TODO: pull this out into it's own object
function getRandomInt(min, max) {
    var double = randomNumberGenerator() / n;
    //double = Math.pow(Math.random(), 2);

    return Math.floor(min + ((max - min) * double));
}
// Lehmer/Park-Miller random number generator
function randomNumberGenerator() {
    seed = (seed * g) % n;
    return seed;
}
module.exports = GenerateDungeon;