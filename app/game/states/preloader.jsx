/**
 * Created by philiplipman on 2/3/16.
 */
var MainMenu = require('./main-menu.jsx');
var GenerateDungeon = require('./generate-dungeon.jsx');
var SpaceShooter = require('./space-shooter.jsx');
var Lighting = require('./lighting.jsx');

function Preloader() {
    this.debug = true;
    //this.debugState = 'space-shooter';
    this.debugState = 'lighting';
}

Preloader.prototype = {
    init() {
        this.loadingBar = this.make.sprite(this.world.centerX - (387 / 2), 400, 'loading');
        this.status = this.add.text(this.world.centerX, 380, 'Loading...', {fill: 'white'});

    },
    preload() {
        this.add.existing(this.loadingBar);
        this.add.existing(this.status);
        this.loadingBar.anchor.setTo(0.5);
        this.status.anchor.setTo(0.5);

        this.game.load.setPreloadSprite(this.loadingBar);

        this.loadScripts();
        this.loadImages();
        this.loadFonts();
        this.loadMusic();
        this.loadSounds();

    },
    loadScripts(){
    },
    loadImages() {
        var assetDirectory = './app/game/assets/';

        var wallAsset = 'wall.png';
        var dudeAsset = 'dude.png';
        var diamondAsset = 'diamond.png';
        var starAsset = 'star.png';

        var blueAsset = 'blue.png';
        var baddieAsset = 'baddie.png';

        // Shooter
        var starFieldAsset = 'starfield.png';
        var explodeAsset = 'explode.png';

        this.load.image('wall', assetDirectory + wallAsset);
        this.load.spritesheet('dude', assetDirectory + dudeAsset, 32, 48);
        this.load.spritesheet('target', assetDirectory + diamondAsset, 32, 28);
        this.load.spritesheet('baddie', assetDirectory + baddieAsset, 32, 28);
        this.load.image('bullet', assetDirectory + starAsset);

        this.load.image('blue', assetDirectory + blueAsset);

        // Shooter
        this.load.image('starfield', assetDirectory + starFieldAsset);
        this.load.spritesheet('explosion', assetDirectory + explodeAsset, 128, 128);

    },
    loadFonts(){
    },
    loadMusic(){
    },
    loadSounds(){
    },
    loadGameStates() {
        this.state.add('main-menu', MainMenu);
        this.state.add('generate-dungeon', GenerateDungeon);
        this.state.add('space-shooter', SpaceShooter);
        this.state.add('lighting', Lighting);
    },
    create() {
        var that = this;
        that.loadGameStates();
        if (that.debug) {
            that.state.start(this.debugState);

        } else {
            setTimeout(function () {
                that.state.start('main-menu');
            }, 2000);

        }
    },
    update() {
    },
};

module.exports = Preloader;
