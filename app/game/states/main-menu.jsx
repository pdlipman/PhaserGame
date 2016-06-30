function MainMenu() {};

MainMenu.prototype = {
    preload: function() {
        this.optionCount = 1;
    },
    create: function() {
        var that = this;
        var style = { font: "65px Arial", fill: "#fff", align: "center" };
        var menu = this.add.text(this.world.centerX, 100, "PhaserGame", style);

        menu.anchor.setTo(0.5);

        this.addMenuItem('Start', function (target) {

            console.log('You clicked Start!');
            that.state.start('space-shooter');

        });
        this.addMenuItem('Options', function (target) {
            console.log('You clicked Options!');
        });
        this.addMenuItem('Quit', function (target) {
            console.log('You clicked Quit!');
        });

    },
    update: function() {},
    addMenuItem(text, callback) {
        var optionStyle = { font: '30pt Arial', fill: '#fff', align: 'right', stroke: 'rgba(0,0,0,0)', srokeThickness: 4};
        var txt = this.add.text(this.world.centerX, (this.optionCount * 80) + 200, text, optionStyle);
        txt.anchor.setTo(0.5);

        var onOver = function (target) {
            target.fill = "#FEFFD5";
            target.stroke = "rgba(200,200,200,0.5)";
        };
        var onOut = function (target) {
            target.fill = "#fff";
            target.stroke = "rgba(0,0,0,0)";
        };
        txt.stroke = "rgba(0,0,0,0";
        txt.strokeThickness = 4;
        txt.inputEnabled = true;
        txt.events.onInputUp.add(callback);
        txt.events.onInputOver.add(onOver);
        txt.events.onInputOut.add(onOut);
        this.optionCount ++;
    },
};

module.exports = MainMenu;