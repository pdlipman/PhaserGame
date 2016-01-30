/**
 * Created by philiplipman on 1/29/16.
 */
'use strict';
var React = require('react');
var GenerateDungeonState = require('./states/generate-dungeon');

var Game = new React.createClass({
    render: function () {
        return (
            <div
                className="gameMain"
                id="gameMain">
            </div>
        );
    },
    createGame: function(width, height) {
        var game = new Phaser.Game(width, height, Phaser.AUTO, 'gameMain');

        game.state.add('generate', GenerateDungeonState);
        game.state.start('generate');
    },
    componentDidMount: function () {
        this.createGame(this.props.width, this.props.height);
    }
});

module.exports = Game;