var React = require('react');

var game;
var rooms = [];
var roomGraphics = [];

var roomCount = 70;

var minSideLength = 4;
var maxSideLength = 15;

var minRatio = 1.0;
var maxRatio = 1.5;

var roomSizeMultiplier = 4;
var padding = 250;

var seed = Date.now();
var g = 16807;
var n = 2147483647;

var separate = true;
var drawGraph = false;
var graphFinished = false;
var itr = 0;

var minRoomArea = 1600;

var mainRooms = [];
var edges = [];
var lines = [];
var subRooms = [];

function getRandomInt(min, max) {

    var double = rngPM() / n;
    double = Math.pow(Math.random(), 2);

    //var double = Math.pow(Math.random(), 2);

    //return Math.round(min + ((max - min) * this.nextDouble()));
    //return Math.floor(Math.random() * (max - min + 1)) + min;

    //console.log('double: ' + double);
    //console.log('result: ' + (Math.floor(min + ((max - min) * double))));

    return Math.floor(min + ((max - min) * double));
}

function rngPM() {
    seed = (seed * g) % n;
    return seed;
}

function getRoom(game) {

    var ratio = 0;
    var width;
    var height;

    while (ratio < minRatio || ratio > maxRatio) {
        width = getRandomInt(minSideLength, maxSideLength);
        height = getRandomInt(minSideLength, maxSideLength);

        if (width > height) {
            ratio = width / height;
        }
        else {
            ratio = height / width;
        }
    }

    this.width = function () {
        return width * roomSizeMultiplier;
    };
    this.height = function () {
        return height * roomSizeMultiplier;
    };

    this.x = function () {
        return getRandomInt(padding, game.world.width - this.width() - padding);
    };
    this.y = function () {
        return getRandomInt(padding, game.world.height - this.height() - padding);
    };
    this.ratio = function () {
        return ratio;
    };
}

function createCsvArray(width, height) {

    var csvArray = [];

    for (var i = 0; i < height; i++) {
        var columns = Array.apply(null, Array(width)).map(Number.prototype.valueOf, 0);
        csvArray.push(columns);
    }

    var output = '';

    for (var i = 0; i < csvArray.length; i++) {
        for (var j = 0; j < csvArray[i].length; j++) {
            output = output + csvArray[i][j] + ',';
        }
        output += '\n';
    }

    console.log(output);

}

var distanceFrom = function (roomA, roomB) {
    var a = roomA.x - roomB.x;
    var b = roomA.y - roomB.y;

    var c = Math.sqrt(a * a + b * b);

    return c;
};

function intersection2(r1, r2) {
    var xmin = Math.max(r1.x, r2.x);
    var xmax1 = r1.x + r1.width;
    var xmax2 = r2.x + r2.width;
    var xmax = Math.min(xmax1, xmax2);
    if (xmax > xmin) {
        var ymin = Math.max(r1.y, r2.y);
        var ymax1 = r1.y + r1.height;
        var ymax2 = r2.y + r2.height;
        var ymax = Math.min(ymax1, ymax2);
        if (ymax > ymin) {
            return true;
        }
    }
    return false;
}

var RandomDungeon = React.createClass({
    displayName: 'RandomDungeon',
    propTypes: {
        width: React.PropTypes.number,
        height: React.PropTypes.number
    },
    render: function () {
        return (
            <div
                className="randomDungeon"
                id="randomDungeon">
            </div>
        );
    },
    createGame: function (width, height) {
        game = new Phaser.Game(width, height, Phaser.AUTO, 'randomDungeon');

        var parent = this;

        var generateState = ({
            preload: function () {
            },
            create: function () {
                parent.createRooms();
                createCsvArray(10, 10);
                //parent.drawRooms(rooms);
            },
            update: function () {
                if (parent.separateRooms() && itr < 300) {
                    parent.drawRooms(rooms);

                    itr++;
                } else if (!graphFinished) {
                    drawGraph = true;
                }

                if (drawGraph) {
                    //console.log('drawGraph');
                    parent.relativeNeighborhoodGraph();

                    for (var i = 0; i < edges.length; i++) {
                        var a = edges[i][0];
                        var b = edges[i][1];

                        var roomA = mainRooms[a];
                        var roomB = mainRooms[b];

                        parent.drawLine(roomA, roomB);
                    }

                    parent.getSubRooms();

                    graphFinished = true;
                    drawGraph = false;
                }
            }
        });

        game.state.add('generate', generateState);
        game.state.start('generate');
    },
    getSubRooms() {

        for (var i = 0; i < lines.length; i++) {
            var lineGraphic = game.add.graphics(0, 0);
            lineGraphic.lineStyle(1, 0x00FF00, 1);
            lineGraphic.beginFill(0x00FF00);
            lineGraphic.drawRect(lines[i].x, lines[i].y, lines[i].width, lines[i].height);

        }
        var iter = 0;

        for (var i = 0; i < rooms.length && i < 300; i++) {
            //console.log('rooms x: ' + rooms[i].x + ' y: ' + rooms[i].y)
            for (var j = 0; j < lines.length && j < 300; j++) {
                //console.log('lines x: ' + lines[j].x + ' y: ' + lines[j].y)

                //var left = lines[j].left;
                //var right = lines[j].right;
                //var top = lines[j].top;
                //var bottom = lines[j].bottom;

                var iter = 0;
                //if (intersection2(rooms[i], lines[j])) {
                //if (iter < 300 && rooms[i] != null && lines[j] != null && Phaser.Rectangle.intersects(rooms[i], lines[j])) {
                if (rooms[i].intersects(lines[j]) || lines[j].intersects(rooms[i])) {
                    iter++;
                    //console.log('intersects: ' + iter);
                    subRooms.push(rooms[i]);
                    if (rooms[i].width * rooms[i].height <= minRoomArea) {

                        roomGraphics[i].beginFill(0x8e2800);
                        roomGraphics[i].drawRect(0, 0, rooms[i].width, rooms[i].height);
                    }

                }
            }
        }

        for (var i = 0; i < subRooms.length; i++) {

        }
    },
    drawLine(outer, inner) {

        if (outer.centerX < inner.centerX) {
            roomA = outer;
            roomB = inner;
        } else {

            roomA = inner;
            roomB = outer;

        }

        dx = roomB.centerX - roomA.centerX;
        dy = roomB.centerY - roomA.centerY;

        var line = game.add.graphics(0, 0);

        var phaserLine;
        var phaserLine2;

        if (getRandomInt(0, 1) === 1) {
            if (dy > 0) {
                console.log('dx > 0');
                phaserLine = new Phaser.Rectangle(roomA.centerX, roomA.centerY, dx, 8);
                phaserLine2 = new Phaser.Rectangle(phaserLine.right, phaserLine.top, 8, dy);
            } else {
                phaserLine = new Phaser.Rectangle(roomA.centerX, roomA.centerY, dx, 8);
                phaserLine2 = new Phaser.Rectangle(phaserLine.right, phaserLine.bottom, 8, dy);
            }
        } else {
            if (dy > 0) {
                phaserLine2 = new Phaser.Rectangle(roomA.centerX, roomA.centerY, dx, 8);
                phaserLine = new Phaser.Rectangle(phaserLine2.right, phaserLine2.top, 8, dy);
            } else {
                phaserLine2 = new Phaser.Rectangle(roomA.centerX, roomA.centerY, dx, 8);
                phaserLine = new Phaser.Rectangle(phaserLine2.right, phaserLine2.bottom, 8, dy);
            }

        }
        //console.log(phaserLine2);
        //console.log(phaserLine);
        lines.push(phaserLine);
        lines.push(phaserLine2);
        // line.beginFill(0x00FF00);
        // line.lineStyle(2, 0xffd900, 1);
        //line.moveTo(roomA.centerX,roomA.centerY);
        //line.lineTo(phaserLine.right, phaserLine.bottom);

        //line.lineTo(phaserLine2.right, phaserLine2.bottom);
        //line.lineTo(roomB.centerX, roomB.centerY);
        //line.endFill();
    },
    relativeNeighborhoodGraph() {


        for (var i = 0; i < rooms.length; i++) {
            var room = rooms[i];
            if (room.width * room.height > minRoomArea) {
                mainRooms.push(room);
            }
        }
        var getLength = mainRooms.length;

        for (var i = 0; i < getLength - 1; i++) {
            for (var j = i + 1; j < getLength; j++) {
                //console.log(' i: ' + i + ' j: '  + j);
                var skip = false;

                for (var k = 0; k < getLength; k++) {
                    if (k === i || k === j) {
                        continue;
                    }
                    var dij = distanceFrom(mainRooms[i], mainRooms[j]);
                    var dik = distanceFrom(mainRooms[i], mainRooms[k]);
                    var djk = distanceFrom(mainRooms[j], mainRooms[k]);

                    //console.log('dij: ' + dij);
                    //console.log('dik: ' + dik);
                    //console.log('djk: ' + djk);

                    if (dij >= Math.max(dik, djk)) {
                        skip = true;
                        break;
                    }
                }

                if (!skip) {
                    edges.push([i, j]);
                    //this.drawLine(mainRooms[i], mainRooms[j]);
                }
            }
        }
    },
    separateRooms: function () {
        separate = false;

        for (var i = 0; i < rooms.length; i++) {
            var roomA = rooms[i];

            var neighborCount = 0;
            var dx = 0;
            var dy = 0;

            for (var j = 0; j < rooms.length; j++) {
                if (i != j) {
                    var roomB = rooms[j];


                    if (Phaser.Rectangle.intersects(roomA, roomB)) {
                        //if (roomA.intersects(roomB)) {
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

                roomA.offset(dx / c, dy / c);
            }
        }

        return separate;
    },
    createRooms: function () {
        for (var i = 0; i < roomCount; i++) {
            var room = new getRoom(game);
            rooms.push(new Phaser.Rectangle(room.x(), room.y(), room.width(), room.height()));
            roomGraphics.push(game.add.graphics(room.x(), room.y()));
        }
    },
    drawRooms: function () {
        for (var i = 0; i < rooms.length; i++) {
            this.drawRoom(roomGraphics[i], rooms[i]);
        }
    },
    drawRoom: function (roomGraphic, room) {
        roomGraphic.x = room.x;
        roomGraphic.y = room.y;
        roomGraphic.lineStyle(2, 0x0fffff, 1);

        if (room.width * room.height > minRoomArea) {
            roomGraphic.beginFill(0x736753);
        }
        roomGraphic.drawRect(0, 0, room.width, room.height);
    },
    componentDidMount: function () {
        this.createGame(this.props.width, this.props.height);
    }

});

module.exports = RandomDungeon;
