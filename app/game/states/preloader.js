/**
 * Created by philiplipman on 2/3/16.
 */

'use strict';
var GenerateDungeonState = require('./generate-dungeon');
var World = require('./world');
function Preloader() {
}

Preloader.prototype = {
    preload: function() {
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
    create: function() {
        this.state.add('world', World);
        this.state.start('world');
    },
    update: function() {}
}

module.exports = Preloader;