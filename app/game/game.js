/**
 * Created by philiplipman on 1/13/16.
 */

var React = require('react');

var GameContent = React.createClass({
    displayName: 'GameContent',
    propTypes: {
        width: React.PropTypes.number,
        height: React.PropTypes.number
    },
    render: function () {
        return (
            <div
                className="gameContent"
                id="gameContent">
            </div>
        );
    },
    createGame: function (width, height) {
        var directory = 'app/game/assets/';
        var game = new Phaser.Game(width, height, Phaser.AUTO, 'gameContent');

        var platforms;
        var player;
        var cursors;
        var stars;

        var score = 0;
        var scoreText;

        var mainState = ({
            preload: function () {
                game.load.image('sky', directory + 'sky.png');
                game.load.image('ground', directory + 'platform.png');
                game.load.image('star', directory + 'star.png');
                game.load.spritesheet('dude', directory + 'dude.png', 32, 48);
            },
            create: function () {
                game.physics.startSystem(Phaser.Physics.ARCADE);

                game.add.sprite(0, 0, 'sky');
                game.add.sprite(0, 0, 'star');

                platforms = game.add.group();
                platforms.enableBody = true;

                var ground = platforms.create(0, game.world.height - 64, 'ground');
                ground.scale.setTo(2, 2);
                ground.body.immovable = true;

                var ledge = platforms.create(400, 400, 'ground');
                ledge.body.immovable = true;

                ledge = platforms.create(-150, 250, 'ground');
                ledge.body.immovable = true;

                player = game.add.sprite(32, game.world.height - 150, 'dude');
                game.physics.arcade.enable(player);
                player.body.bounce.y = 0.2;
                player.body.gravity.y = 300;
                player.body.collideWorldBounds = true;

                player.animations.add('left', [0, 1, 2, 3], 10, true);
                player.animations.add('right', [5, 6, 7, 8], 10, true);

                cursors = game.input.keyboard.createCursorKeys();

                stars = game.add.group();
                stars.enableBody = true;

                for (var i = 0; i < 12; i++) {
                    var star = stars.create(i * 70, 0, 'star');
                    star.body.gravity.y = 6;
                    star.body.bounce.y = 0.7 + (Math.random() * 0.2);
                }

				scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
            },
            update: function () {
                game.physics.arcade.collide(player, platforms);
                game.physics.arcade.collide(stars, platforms);
                game.physics.arcade.overlap(player, stars, this.collectStar, null, this);
                player.body.velocity.x = 0;

                if (cursors.left.isDown && !cursors.right.isDown) {
                    player.body.velocity.x = -150;
                    player.animations.play('left');
                } else if (cursors.right.isDown && !cursors.left.idDown) {
                    player.body.velocity.x = 150;
                    player.animations.play('right');
                } else {
                    player.animations.stop();
                    player.frame = 4;
                }

                if (cursors.up.isDown && player.body.touching.down) {
                    player.body.velocity.y = -350;
                }
            },
            collectStar: function (player, star) {
                star.kill();

				score += 10;
				scoreText.text = 'Score: ' + score;
            }
        });

        game.state.add('main', mainState);
        game.state.start('main');

    },
    componentDidMount: function () {
        this.createGame(this.props.width, this.props.height);
    }
});

module.exports = GameContent;
//
//ReactDOM.render(
//    <GameContent width={800} height={600} />,
//    document.getElementById('gameContent')
//);
