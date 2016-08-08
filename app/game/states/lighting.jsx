/**
 * Created by philiplipman on 2/10/16.
 */
'use strict';

var light;
var bitmap;
//var lightBitmap;
//var walls;

var tileSize = 64;
var map;
var layer;

function Lighting() {
};

Lighting.prototype = {
    preload: function () {
        var assetDirectory = 'app/game/assets/';
        var blockAsset = 'block.png';
        var lightAsset = 'light.png';
        this.load.image('block', assetDirectory + blockAsset);
        this.load.image('light', assetDirectory + lightAsset);

        // World Start
        this.load.tilemap('testmap', assetDirectory + 'maps/test.csv', null, Phaser.Tilemap.CSV);

        // World End
    },
    create: function () {

        // World Start
        map = this.add.tilemap('testmap', tileSize, tileSize);

        map.setCollision(0);
        layer = map.createLayer(0);

        layer.resizeWorld();
        layer.collidingTileOverfill = true;
        layer.debug = true;

        var worldInfo = this.game.add.text(this.game.world.width - 350, this.game.world.height - 40, 'begin', {
            font: '20px Arial',
            fill: '#fff'
        });
        worldInfo.render = function (x1, y1, x2, y2) {
            worldInfo.text = 'x1:' + x1 + ', y1:' + y1 + ', x2:' + x2 + ', y2:' + y2;
        };
        worldInfo.fixedToCamera = true;
        this.worldInfo = worldInfo;

        var lightInfo = this.game.add.text(this.game.world.width - 350, this.game.world.height - 80, 'begin', {
            font: '20px Arial',
            fill: '#fff'
        });
        lightInfo.render = function (x1, y1) {
            lightInfo.text = 'x1:' + x1 + ', y1:' + y1;
        };
        lightInfo.fixedToCamera = true;
        this.lightInfo = lightInfo;

        var pointsInfo = this.game.add.text(this.game.world.width - 550, this.game.world.height - 120, 'begin', {
            font: '20px Arial',
            fill: '#fff'
        });
        pointsInfo.render = function (x1, y1, x2, y2) {
            pointsInfo.text = 'point[0]x:' + x1 + ', point[0]y:' + y1 + ', lightx:' + x2 + ', lighty:' + y2;
        };
        pointsInfo.fixedToCamera = true;
        this.pointsInfo = pointsInfo;


        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.game.stage.backgroundColor = 0x4488cc;

        this.light = this.game.add.sprite(this.game.world.width / 2, this.game.world.height / 2, 'light');
        //this.camera.follow(this.light);

        this.light.anchor.setTo(0.5, 0.5);
        this.bitmap = this.game.add.bitmapData(this.game.world.width, this.game.world.height);

        this.bitmap.context.fillStyle = 'rgb(255, 255, 255)';
        this.bitmap.context.strokeStyle = 'rgb(255, 255, 255)';
        var lightBitmap = this.game.add.image(0, 0, this.bitmap);

        lightBitmap.blendMode = Phaser.blendModes.MULTIPLY;
        // Create a bitmap for drawing rays
        //this.rayBitmap.fixedToCamera = true;
        //this.rayBitmapImage.fixedToCamera = true;

        // Setup function for hiding or showing rays
        this.game.input.onTap.add(this.toggleRays, this);


        this.rayBitmap = this.game.add.bitmapData(this.game.world.width, this.game.world.height);
        this.rayBitmapImage = this.game.add.image(0, 0, this.rayBitmap);
        this.rayBitmapImage.visible = false;

        //this.walls = this.game.add.group();

    },
    toggleRays: function () {
        // Toggle the visibility of the rays when the pointer is clicked
        if (this.rayBitmapImage.visible) {
            this.rayBitmapImage.visible = false;
        } else {
            this.rayBitmapImage.visible = true;
        }
    },
    render: function () {
        this.game.debug.cameraInfo(this.game.camera, 32, 32);
    },
    update: function () {
        var that = this;
        var game = that.game;
        var cursors = that.cursors;

        var x1 = this.game.camera.view.x;
        var y1 = this.game.camera.view.y;
        var x2 = x1 + this.game.camera.view.width;
        var y2 = y1 + this.game.camera.view.height;
        this.worldInfo.render(x1, y1, x2, y2);
        if (cursors.up.isDown) {
            that.game.camera.y -= 4;
        }
        else if (cursors.down.isDown) {
            that.game.camera.y += 4;
        }

        if (cursors.left.isDown) {
            that.game.camera.x -= 4;
        }
        else if (cursors.right.isDown) {
            that.game.camera.x += 4;
        }

        this.light.x = that.game.input.mousePointer.worldX;
        this.light.y = that.game.input.mousePointer.worldY;

        this.lightInfo.render(this.light.x, this.light.y);


        this.bitmap.context.fillStyle = 'rgb(100, 100, 100)';
        this.bitmap.context.fillRect(x1, y1, x2, y2);

        var stageCorners = [
            new Phaser.Point(x1, y1),
            new Phaser.Point(x2, y1),
            new Phaser.Point(x2, y2),
            new Phaser.Point(x1, y2)
        ];

        this.walls = layer.getTiles(this.game.camera.view.x,
            this.game.camera.view.y,
            this.game.camera.width,
            this.game.camera.height, true, true);

        // Ray casting!
        // Cast rays through the corners of each wall towards the stage edge.
        // Save all of the intersection points or ray end points if there was no intersection.
        var points = [];
        var ray = null;
        var intersect;
        var i;
        this.walls.forEach(function (wall) {
            // Create a ray from the light through each corner out to the edge of the stage.
            // This array defines points just inside of each corner to make sure we hit each one.
            // It also defines points just outside of each corner so we can see to the stage edges.
            var wallX = wall.left;
            var wallY = wall.top;

            var corners = [];

            if (wall.faceLeft || wall.faceTop) {
                corners.push(new Phaser.Point(wallX + 0.1, wallY + 0.1));
                corners.push(new Phaser.Point(wallX - 0.1, wallY - 0.1));
            }

            if (wall.faceRight || wall.faceTop) {
                corners.push(new Phaser.Point(wallX - 0.1 + wall.width, wallY + 0.1));
                corners.push(new Phaser.Point(wallX + 0.1 + wall.width, wallY - 0.1));
            }

            if (wall.faceRight || wall.faceBottom) {
                corners.push(new Phaser.Point(wallX - 0.1 + wall.width, wallY - 0.1 + wall.height));
                corners.push(new Phaser.Point(wallX + 0.1 + wall.width, wallY + 0.1 + wall.height));
            }

            if (wall.faceLeft || wall.faceBottom) {
                corners.push(new Phaser.Point(wallX + 0.1, wallY - 0.1 + wall.height));
                corners.push(new Phaser.Point(wallX - 0.1, wallY + 0.1 + wall.height));
            }

            // Calculate rays through each point to the edge of the stage
            for (i = 0; i < corners.length; i++) {
                var c = corners[i];

                // Here comes the linear algebra.
                // The equation for a line is y = slope * x + b
                // b is where the line crosses the left edge of the stage
                var slope = (c.y - this.light.y) / (c.x - this.light.x);
                var b = this.light.y - slope * this.light.x;

                var end = null;

                if (c.x === this.light.x) {
                    // Vertical lines are a special case
                    if (c.y <= this.light.y) {
                        end = new Phaser.Point(this.light.x, y1);
                    } else {
                        end = new Phaser.Point(this.light.x, y2);
                    }
                } else if (c.y === this.light.y) {
                    // Horizontal lines are a special case
                    if (c.x <= this.light.x) {
                        end = new Phaser.Point(x1, this.light.y);
                    } else {
                        end = new Phaser.Point(x2, this.light.y);
                    }
                } else {
                    // Find the point where the line crosses the stage edge
                    var left = new Phaser.Point(0, b);
                    var right = new Phaser.Point(this.game.world.width, slope * this.game.world.width + b);
                    var top = new Phaser.Point(-b / slope, 0);
                    var bottom = new Phaser.Point((this.game.world.height - b) / slope, this.game.world.height);

                    // Get the actual intersection point
                    if (c.y <= this.light.y && c.x >= this.light.x) {
                        if (top.x >= 0 && top.x <= this.game.width) {
                            end = top;
                        } else {
                            end = right;
                        }
                    } else if (c.y <= this.light.y && c.x <= this.light.x) {
                        if (top.x >= 0 && top.x <= this.game.width) {
                            end = top;
                        } else {
                            end = left;
                        }
                    } else if (c.y >= this.light.y && c.x >= this.light.x) {
                        if (bottom.x >= 0 && bottom.x <= this.game.width) {
                            end = bottom;
                        } else {
                            end = right;
                        }
                    } else if (c.y >= this.light.y && c.x <= this.light.x) {
                        if (bottom.x >= 0 && bottom.x <= this.game.width) {
                            end = bottom;
                        } else {
                            end = left;
                        }
                    }
                }

                // Create a ray
                ray = new Phaser.Line(this.light.x, this.light.y, end.x, end.y);

                // Check if the ray intersected the wall
                intersect = this.getWallIntersection(ray);
                if (intersect) {
                    // This is the front edge of the light blocking object
                    points.push(intersect);
                } else {
                    // Nothing blocked the ray
                    points.push(ray.end);
                }
            }
        }, this);

        // Shoot rays at each of the stage corners to see if the corner
        // of the stage is in shadow. This needs to be done so that
        // shadows don't cut the corner.
        for (i = 0; i < stageCorners.length; i++) {
            ray = new Phaser.Line(this.light.x, this.light.y,
                stageCorners[i].x, stageCorners[i].y);
            intersect = this.getWallIntersection(ray);
            if (!intersect) {
                // Corner is in light
                points.push(stageCorners[i]);
            }
        }

        // Now sort the points clockwise around the light
        // Sorting is required so that the points are connected in the right order.
        //
        // This sorting algorithm was copied from Stack Overflow:
        // http://stackoverflow.com/questions/6989100/sort-points-in-clockwise-order
        //
        // Here's a pseudo-code implementation if you want to code it yourself:
        // http://en.wikipedia.org/wiki/Graham_scan
        var center = {x: this.light.x, y: this.light.y};
        points = points.sort(function (a, b) {
            if (a.x - center.x >= 0 && b.x - center.x < 0)
                return 1;
            if (a.x - center.x < 0 && b.x - center.x >= 0)
                return -1;
            if (a.x - center.x === 0 && b.x - center.x === 0) {
                if (a.y - center.y >= 0 || b.y - center.y >= 0)
                    return 1;
                return -1;
            }

            // Compute the cross product of vectors (center -> a) x (center -> b)
            var det = (a.x - center.x) * (b.y - center.y) - (b.x - center.x) * (a.y - center.y);
            if (det < 0)
                return 1;
            if (det > 0)
                return -1;

            // Points a and b are on the same line from the center
            // Check which point is closer to the center
            var d1 = (a.x - center.x) * (a.x - center.x) + (a.y - center.y) * (a.y - center.y);
            var d2 = (b.x - center.x) * (b.x - center.x) + (b.y - center.y) * (b.y - center.y);
            return 1;
        });

        // Connect the dots and fill in the shape, which are cones of light,
        // with a bright white color. When multiplied with the background,
        // the white color will allow the full color of the background to
        // shine through.
        this.bitmap.context.beginPath();
        this.bitmap.context.fillStyle = 'rgb(255, 255, 255)';
        this.bitmap.context.moveTo(points[0].x, points[0].y);
        for (var j = 0; j < points.length; j++) {
            this.bitmap.context.lineTo(points[j].x, points[j].y);
        }
        this.bitmap.context.closePath();
        this.bitmap.context.fill();

        // Draw each of the rays on the rayBitmap
        this.rayBitmap.context.clearRect(x1,y1,x2,y2);
        this.rayBitmap.context.beginPath();
        this.rayBitmap.context.strokeStyle = 'rgb(255, 255, 255)';
        this.rayBitmap.context.fillStyle = 'rgb(255, 255, 255)';
        this.rayBitmap.context.moveTo(points[0].x, points[0].y);
        for (var k = 0; k < points.length; k++) {
            this.rayBitmap.context.moveTo(this.light.x, this.light.y);
            this.rayBitmap.context.lineTo(points[k].x, points[k].y);
            this.rayBitmap.context.fillRect(points[k].x - 2, points[k].y - 2, 4, 4);
        }
        this.rayBitmap.context.stroke();

        // This just tells the engine it should update the texture cache
        this.bitmap.dirty = true;
        this.rayBitmap.dirty = true;
    },
    getWallIntersection(ray) {
        var distanceToWall = Number.POSITIVE_INFINITY;
        var closestIntersection = null;

        // For each of the walls...
        this.walls.forEach(function (wall) {
            // Create an array of lines that represent the four edges of each wall

            var wallX = wall.x * wall.width;
            var wallY = wall.y * wall.height;
            
            var lines = [
                new Phaser.Line(wallX, wallY, wallX + wall.width, wallY),
                new Phaser.Line(wallX, wallY, wallX, wallY + wall.height),
                new Phaser.Line(wallX + wall.width, wallY,
                    wallX + wall.width, wallY + wall.height),
                new Phaser.Line(wallX, wallY + wall.height,
                    wallX + wall.width, wallY + wall.height)
            ];

            // Test each of the edges in this wall against the ray.
            // If the ray intersects any of the edges then the wall must be in the way.
            for (var i = 0; i < lines.length; i++) {
                var intersect = Phaser.Line.intersects(ray, lines[i]);
                if (intersect) {
                    // Find the closest intersection
                    var distance =
                        this.game.math.distance(ray.start.x, ray.start.y, intersect.x, intersect.y);
                    if (distance < distanceToWall) {
                        distanceToWall = distance;
                        closestIntersection = intersect;
                    }
                }
            }
        }, this);

        return closestIntersection;
    }
};

module.exports = Lighting;
