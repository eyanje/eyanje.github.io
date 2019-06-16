define(["require", "exports", "../graphics", "../data/resourcemanager"], function (require, exports, graphics_1, resourcemanager_1) {
    "use strict";
    exports.__esModule = true;
    var BackgroundObject = /** @class */ (function () {
        function BackgroundObject(spritePath, x, y, width, height) {
            this.sprite = new graphics_1.Sprite(spritePath);
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        BackgroundObject.prototype.update = function () {
            this.sprite.update();
        };
        BackgroundObject.prototype.render = function (graphicsContext, perspectiveX, perspectiveY) {
            this.sprite.render(graphicsContext, this.x, this.y, this.width, this.height, perspectiveX, perspectiveY);
        };
        return BackgroundObject;
    }());
    exports.BackgroundObject = BackgroundObject;
    var SolidObject = /** @class */ (function () {
        function SolidObject(spritePath, x, y, width, height, description) {
            this.sprite = new graphics_1.Sprite(spritePath);
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.description = description;
        }
        SolidObject.prototype.update = function () {
            this.sprite.update();
        };
        SolidObject.prototype.render = function (graphicsContext, perspectiveX, perspectiveY) {
            //gc.setFill(new Color(0, 1, 0, 0.2));
            //gc.fillRect(x, y, width, height);
            this.sprite.render(graphicsContext, this.x, this.y, this.width, this.height, perspectiveX, perspectiveY);
        };
        SolidObject.prototype.contains = function (x, y) {
            return x >= this.x && x <= this.x + this.width &&
                y >= this.y && y <= this.y + this.height;
        };
        return SolidObject;
    }());
    exports.SolidObject = SolidObject;
    var Teleport = /** @class */ (function () {
        function Teleport(x, y, width, height, destX, destY) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.destX = destX;
            this.destY = destY;
        }
        return Teleport;
    }());
    exports.Teleport = Teleport;
    var World = /** @class */ (function () {
        function World(path) {
            var _this = this;
            if (path === undefined) {
                path = './world/world.wld';
            }
            this.path = path;
            this.solids = new Array();
            this.nonsolids = new Array();
            this.teleports = new Array();
            resourcemanager_1.getLines(path, this, function (lines) { return lines.forEach(function (line) {
                if (line.length > 0 && line.includes(' ')) {
                    var type = line.substring(0, line.indexOf(' '));
                    if (type !== '#') {
                        line = line.substring(line.indexOf(' ') + 1);
                        var x = line.substring(0, line.indexOf(' '));
                        line = line.substring(line.indexOf(' ') + 1);
                        var y = line.substring(0, line.indexOf(' '));
                        line = line.substring(line.indexOf(' ') + 1);
                        var width = line.substring(0, line.indexOf(' '));
                        line = line.substring(line.indexOf(' ') + 1);
                        var height = line.substring(0, line.indexOf(' '));
                        line = line.substring(line.indexOf(' ') + 1);
                        switch (type) {
                            case 'solid':
                                {
                                    if (line.includes(' ')) {
                                        var dataPath = line.substring(0, line.indexOf(' '));
                                        line = line.substring(line.indexOf(' ') + 1);
                                        _this.solids.push(new SolidObject(dataPath, parseInt(x), parseInt(y), parseInt(width), parseInt(height), line));
                                    }
                                    else {
                                        _this.solids.push(new SolidObject(line, parseInt(x), parseInt(y), parseInt(width), parseInt(height), null));
                                    }
                                }
                                break;
                            case 'nonsolid':
                                {
                                    _this.nonsolids.push(new BackgroundObject(line, parseInt(x), parseInt(y), parseInt(width), parseInt(height)));
                                }
                                break;
                            case "teleport":
                                {
                                    var destX = line.substring(0, line.indexOf(' '));
                                    line = line.substring(line.indexOf(' ') + 1);
                                    _this.teleports.push(new Teleport(parseInt(x), parseInt(y), parseInt(width), parseInt(height), parseInt(destX), parseInt(line)));
                                }
                                break;
                        }
                    }
                }
            }); });
        }
        World.prototype.update = function () {
            this.nonsolids.forEach(function (nonsolid) {
                nonsolid.update();
            });
            this.solids.forEach(function (obstacle) {
                obstacle.update();
            });
        };
        World.prototype.render = function (graphicsContext, perspectiveX, perspectiveY) {
            this.nonsolids.forEach(function (nonsolid) {
                nonsolid.render(graphicsContext, perspectiveX, perspectiveY);
            });
            this.solids.forEach(function (solid) {
                solid.render(graphicsContext, perspectiveX, perspectiveY);
            });
        };
        return World;
    }());
    exports.World = World;
});
