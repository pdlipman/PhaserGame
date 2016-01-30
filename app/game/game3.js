/**
 * Created by philiplipman on 1/28/16.
 */

var React = require('react');

var SpriteDungeon = new React.createClass({
	displayName: 'SpriteDungeon',
	render: function() {
		return (
			<div className="spriteDungeon"
				id="spriteDungeon">
			</div>
		);
	},
	createGame: function(width, height) {
		var assetDirectory = 'app/game/assets/';
        var wallAsset = 'wall.png';

		var game = new Phaser.Game(width, height, Phaser.AUTO, 'spriteDungeon');

        var walls;

		var generateState = ({
			preload: function() {
                game.load.image('wall', assetDirectory + wallAsset);
            },
			create: function() {
				game.physics.startSystem(Phaser.Physics.ARCADE);

                game.world.setBounds(0, 0, 1920, 1920);

                walls = game.add.group();
                walls.enableBody = true;
            },
			update: function() {}
		});

        game.state.add('generate', generateState);
        game.state.start('generate');
	},
    createRooms: function () {
        for (var i = 0; i < roomCount; i++) {
            var room = new getRoom(game);
            rooms.push(new Phaser.Rectangle(room.x(), room.y(), room.width(), room.height()));
            roomGraphics.push(game.add.graphics(room.x(), room.y()));
        }
    },
    componentDidMount: function () {
        this.createGame(this.props.width, this.props.height);
    }

});

module.exports = SpriteDungeon;