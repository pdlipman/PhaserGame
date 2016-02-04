/**
 * Created by philiplipman on 1/29/16.
 */
'use strict';
var React = require('react');
var PreloaderState = require('./states/preloader');

//var Phaser = require('./phaser/phaser.js');
var game = null;
var Game = new React.createClass({
    render: function () {
        return (
            <div
                className="gameMain"
                id="gameMain">
            </div>

        );
    },
    createGame: function (width, height) {
        game = new Phaser.Game(width, height, Phaser.AUTO, 'gameMain');

        game.state.add('preloader', PreloaderState);

        //var pro = new PreloaderState();
        //alert(pro.test());

        game.state.start('preloader');
    },
    componentDidMount: function () {
        this.createGame(this.props.width, this.props.height);
    }

});

module.exports = Game;