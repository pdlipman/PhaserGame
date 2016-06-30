/**
 * Created by philiplipman on 1/29/16.
 */
var React = require('react');

var Boot = require('./states/boot.jsx');
//const World = require('./states/world.jsx');
//const Lighting = require('./states/lighting.jsx');
//const GenerateDungeon = require('./states/generate-dungeon.jsx');

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            width: props.width,
            height: props.height,
        };
    }

    componentDidMount() {
        this.createGame(this.props.width, this.props.height);
    }

    createGame(width, height) {
        const game = new Phaser.Game(width, height, Phaser.AUTO, 'gameMain'); // eslint-disable-line

        game.state.add('boot', Boot);
        //game.state.add('generate', GenerateDungeon);
        //game.state.add('world', World);
        //game.state.add('lighting', Lighting);

        game.state.start('boot');
    }

    render() {
        return (
            <div
                className="gameMain"
                id="gameMain"
            >
            </div>
        );
    }
}

Game.propTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
};

Game.defaultProps = {
    width: 640,
    height: 480,
};

module.exports = Game;
