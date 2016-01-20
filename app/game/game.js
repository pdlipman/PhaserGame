/**
 * Created by philiplipman on 1/13/16.
 */

var React = require('react');
var ReactDOM = require('react-dom');

var GameContent = React.createClass({
    displayName: 'GameContent',
    propTypes: {
        width: React.PropTypes.number,
        height: React.PropTypes.number
    },
    render: function() {
        return (
            <div className="gameContent" id="gameContent">
                Hello, world! I am a game content box.
            </div>
        );
    },
    createGame: function(width, height) {
        var directory = 'app/game/assets/';
        var game = new Phaser.Game(width, height, Phaser.AUTO, 'gameContent');

        var mainState = ({
            preload: function() {
                game.load.image('sky', directory + 'sky.png');
                game.load.image('ground', directory + 'platform.png');
                game.load.image('star', directory + 'star.png');
                game.load.spritesheet('dude', directory + 'dude.png', 32, 48);
            },
            create: function() {
                game.physics.startSystem(Phaser.Physics.ARCADE);

                game.add.sprite(0, 0, 'sky');
            },
            update: function() {}
        });

        game.state.add('main', mainState);
        game.state.start('main');

    },
    componentDidMount: function() {
        this.createGame(this.props.width, this.props.height);
    }
});

module.exports = GameContent;
//
//ReactDOM.render(
//    <GameContent width={800} height={600} />,
//    document.getElementById('gameContent')
//);