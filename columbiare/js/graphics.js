var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./data/resourcemanager"], function (require, exports, resourcemanager_1) {
    "use strict";
    exports.__esModule = true;
    var PImage = /** @class */ (function () {
        function PImage(path, x1, y1, x2, y2) {
            var _this = this;
            this.image = new Image();
            this.image.src = './res/' + path;
            this.ready = false;
            this.image.addEventListener('load', function () {
                _this.ready = true;
            });
            // Subimages to be implemented later
            if (x1 !== undefined) {
                console.info('Subimages are not yet implemented');
            }
        }
        PImage.prototype.render = function (graphicsContext, x, y, width, height, perspectiveX, perspectiveY) {
            if (this.ready) {
                if (width === undefined || height === undefined) {
                    width = this.image.width;
                    height = this.image.height;
                }
                if (perspectiveX === undefined || perspectiveY === undefined ||
                    (x + width >= perspectiveX - document.getElementById('canvas').clientWidth / 2 &&
                        y + height >= perspectiveY - document.getElementById('canvas').clientHeight / 2 &&
                        x <= perspectiveX + document.getElementById('canvas').clientWidth / 2 &&
                        y <= perspectiveY + document.getElementById('canvas').clientHeight / 2)) {
                    graphicsContext.drawImage(this.image, x, y, width, height);
                }
            }
        };
        return PImage;
    }());
    exports.PImage = PImage;
    var Pattern = /** @class */ (function (_super) {
        __extends(Pattern, _super);
        function Pattern() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Pattern.prototype.render = function (graphicsContext, x, y, width, height, perspectiveX, perspectiveY) {
            if (this.ready) {
                if (width === undefined || height === undefined) {
                    _super.prototype.render.call(this, graphicsContext, x, y, undefined, undefined, perspectiveX, perspectiveY);
                }
                else {
                    for (var sx = x; sx + this.image.width / 2 <= x + width; sx += this.image.width) {
                        if (perspectiveX !== undefined) {
                            if (sx + this.image.width < perspectiveX - document.getElementById('canvas').clientWidth / 2) {
                                continue;
                            }
                            if (sx > perspectiveX + document.getElementById('canvas').clientWidth / 2) {
                                break;
                            }
                        }
                        for (var sy = y; sy + this.image.height / 2 <= y + height; sy += this.image.height) {
                            if (perspectiveY !== undefined) {
                                if (sy + this.image.height < perspectiveY - document.getElementById('canvas').clientHeight / 2) {
                                    continue;
                                }
                                if (sy > perspectiveY + document.getElementById('canvas').clientHeight / 2) {
                                    break;
                                }
                            }
                            graphicsContext.drawImage(this.image, sx, sy);
                        }
                    }
                }
            }
        };
        return Pattern;
    }(PImage));
    exports.Pattern = Pattern;
    var PAnimation = /** @class */ (function () {
        function PAnimation() {
            this.frames = new Array();
            this.frameLengths = new Array();
            this.frame = 0;
            this.subframe = 0;
        }
        PAnimation.prototype.addFrame = function (frameLength, frame) {
            this.frames.push(frame);
            this.frameLengths.push(frameLength);
        };
        PAnimation.prototype.update = function () {
            this.subframe++;
            if (this.subframe >= this.frameLengths[this.frame]) {
                this.frame++;
                this.subframe = 0;
                if (this.frame >= this.frames.length) {
                    this.frame = 0;
                }
            }
        };
        PAnimation.prototype.render = function (graphicsContext, x, y, width, height, perspectiveX, perspectiveY) {
            this.frames[this.frame].render(graphicsContext, x, y, width, height, perspectiveX, perspectiveY);
        };
        return PAnimation;
    }());
    exports.PAnimation = PAnimation;
    var Sprite = /** @class */ (function () {
        function Sprite(path) {
            var _this = this;
            this.animations = new Map();
            var current = null;
            this.currentAnimation = null;
            resourcemanager_1.getLines(path, this, function (lines) { return lines.forEach(function (line) {
                // Read each line in the file for data
                line = line.trim();
                var tokens = line.split(' ');
                if (tokens.length >= 1) {
                    switch (tokens[0]) {
                        case "a":
                            {
                                // Add a new animation
                                var name_1 = line.substring(line.indexOf(' ') + 1);
                                current = new PAnimation();
                                _this.addAnimation(name_1, current);
                            }
                            break;
                        case "i":
                            {
                                // Add a new frame
                                if (tokens.length >= 3) {
                                    // Extract basic data
                                    var frameLength = parseInt(tokens[1]);
                                    var imgPath = tokens[2];
                                    var frame = null;
                                    if (tokens.length <= 3 /* data only*/) {
                                        frame = new PImage(imgPath);
                                    }
                                    else {
                                        // Parse first two numbers
                                        var t0 = parseInt(tokens[3]);
                                        var t1 = parseInt(tokens[4]);
                                        if (tokens.length <= 3 /* data */ + 2 /* width and height */) {
                                            frame = new PImage(imgPath, t0, t1); // Width and height
                                        }
                                        else {
                                            // Parse next two numbers (width and height)
                                            var t2 = parseInt(tokens[5]);
                                            var t3 = parseInt(tokens[6]);
                                            frame = new PImage(imgPath, t0, t1, t2, t3); // x y width height
                                        }
                                    }
                                    if (!current) {
                                        console.error("In " + path + " frame loaded before animation");
                                    }
                                    else {
                                        // Add frame to the last animation created
                                        current.addFrame(frameLength, frame);
                                    }
                                }
                            }
                            break;
                        case "p":
                            {
                                // Add a new pattern
                                if (tokens.length >= 3) {
                                    // Extract basic data
                                    var frameLength = parseInt(tokens[1]);
                                    var imgPath = tokens[2];
                                    var frame = null;
                                    if (tokens.length <= 3 /* data only*/) {
                                        frame = new Pattern(imgPath);
                                    }
                                    else {
                                        // Parse first two numbers
                                        var t0 = parseInt(tokens[2]);
                                        var t1 = parseInt(tokens[3]);
                                        if (tokens.length <= 3 /* data */ + 2 /* width and height */) {
                                            frame = new Pattern(imgPath, t0, t1); // Width and height
                                        }
                                        else {
                                            // Parse next two numbers (width and height)
                                            var t2 = parseInt(tokens[2]);
                                            var t3 = parseInt(tokens[3]);
                                            frame = new Pattern(imgPath, t0, t1, t2, t3); // x y width height
                                        }
                                    }
                                    if (!current) {
                                        console.error("In " + path + " frame loaded before animation");
                                    }
                                    else {
                                        // Add frame to the last animation created
                                        current.addFrame(frameLength, frame);
                                    }
                                }
                            }
                            break;
                    }
                }
            }); });
        }
        Sprite.prototype.addAnimation = function (name, animation) {
            if (name && animation) {
                this.animations.set(name, animation);
                if (!this.currentAnimation) {
                    this.currentAnimation = name;
                }
            }
        };
        Sprite.prototype.update = function () {
            if (this.animations.get(this.currentAnimation)) {
                this.animations.get(this.currentAnimation).update();
            }
        };
        Sprite.prototype.render = function (graphicsContext, x, y, width, height, perspectiveX, perspectiveY) {
            if (this.animations.get(this.currentAnimation)) {
                this.animations.get(this.currentAnimation).render(graphicsContext, x, y, width, height, perspectiveX, perspectiveY);
            }
        };
        Sprite.prototype.setCurrentAnimation = function (currentAnimation) {
            this.currentAnimation = currentAnimation;
        };
        return Sprite;
    }());
    exports.Sprite = Sprite;
});
