/**
 * Created by philiplipman on 2/3/16.
 */
var Preloader = require('./preloader.jsx');

function Boot() {};

Boot.prototype = {
    preload: function() {
        var assetDirectory = './app/game/assets/';
        var loadingAsset = 'loading.png';

        this.load.image('loading',  assetDirectory + loadingAsset);

    },
    create: function() {
        this.state.add('preloader', Preloader);
        this.state.start('preloader');
    },
    update: function() {},
};

module.exports = Boot;