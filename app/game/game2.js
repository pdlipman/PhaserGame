var React = require('react');

var game;
var rooms = [];
var roomGraphics = [];

var roomCount = 150;

var minSideLength = 5;
var maxSideLength = 25;

var minRatio = 1.0;
var maxRatio = 1.6;

var roomMultiplier = 2;
var padding = 100;

var seed = Date.now();
var g = 16807;
var n = 2147483647;

function getRandomInt(min, max) {

    var double = PMRng() / n;
    //return Math.round(min + ((max - min) * this.nextDouble()));
    //return Math.floor(Math.random() * (max - min + 1)) + min;

    //console.log('double: ' + double);
    //console.log('result: ' + (Math.floor(min + ((max - min) * double))));

    return Math.floor(min + ((max - min) * double));
}

var PMRng = function () {
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
        return width * roomMultiplier;
    },
        this.height = function () {
            return height * roomMultiplier;
        },
        this.x = function () {
            return getRandomInt(padding, game.world.width - this.width() - padding);
        },
        this.y = function () {
            return getRandomInt(padding, game.world.height - this.height() - padding);
        },
        this.ratio = function () {
            return ratio;
        };
}


var distanceFrom = function (roomA, roomB) {
    var a = roomA.x - roomB.x;
    var b = roomA.y - roomB.y;

    var c = Math.sqrt(a * a + b * b);

    return c;
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
                //parent.drawRooms(rooms);
            },
            update: function () {
                parent.separateRooms();
                parent.drawRooms(rooms);

            }
        });

        game.state.add('generate', generateState);
        game.state.start('generate');
    },
    separateRooms: function () {

        //for each (var agent:Agent in agentArray)
        //{
        //    if (agent != myAgent)
        //    {
        //        if (myAgent.distanceFrom(agent) < 300)
        //        {
        //            v.x += agent.velocity.x;
        //            v.y += agent.velocity.y;
        //            neighborCount++;
        //        }
        //
        //    }
        //
        //}

        for (var i = 0; i < rooms.length; i++) {
            var roomA = rooms[i];

            var neighborCount = 0;
            var dx = 0;
            var dy = 0;

            for (var j = 0; j < rooms.length; j++) {
                if (i != j) {
                    var roomB = rooms[j];


                    if (roomA.intersects(roomB)) {
                        //v.x = v.x + (self._rooms[_agent].startX - self._rooms[i].startX)
                        //v.y = v.y + (self._rooms[_agent].startY - self._rooms[i].startY)
                        dx = dx + Math.floor(roomA.x - roomB.x);
                        dy = dy + Math.floor(roomA.y - roomB.y);
                        neighborCount++;
                    }

                }
            }

            if (neighborCount != 0) {
                dx = dx / neighborCount;
                dy = dy / neighborCount;

                var c = Math.sqrt(dx * dx + dy * dy);

                roomA.offset(dx/c, dy/c);
            }
        }

        //for (var i = 0; i < rooms.length; i++) {
        //    for (var j = i + 1; j < rooms.length; j++) {
        //        var roomA = rooms[i];
        //        var roomB = rooms[j];
        //
        //        var dxa = 2;
        //        var dxb = -2;
        //
        //        var dya = 2;
        //        var dyb = -2;
        //
        //        while (roomA.intersects(roomB)) {
        //
        //            if (roomA.x <= roomB.x) {
        //                dxa *= -1;
        //                dxb *= -1;
        //            }
        //
        //            if (roomA.y <= roomB.y) {
        //                dxb *= -1;
        //                dyb *= -1;
        //            }
        //
        //            roomA.offset(dxa, dya);
        //            roomB.offset(dxb, dyb);
        //        }
        //    }
        //}
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
            //console.log('left: ' + rooms[i].left + ', right: ' + rooms[i].right);
            //console.log('top: ' + rooms[i].top + ', right: ' + rooms[i].bottom);
            this.drawRoom(roomGraphics[i], rooms[i]);
        }
    },
    drawRoom: function (roomGraphic, room) {
        roomGraphic.x = room.x;
        roomGraphic.y = room.y;
        roomGraphic.lineStyle(2, 0x0fffff, 1);
        roomGraphic.drawRect(0, 0, room.width, room.height);
    },
    componentDidMount: function () {
        this.createGame(this.props.width, this.props.height);
    }

});

module.exports = RandomDungeon;
