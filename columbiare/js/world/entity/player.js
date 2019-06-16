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
define(["require", "exports", "./entity", "../../data/resourcemanager", "../../graphics"], function (require, exports, entity_1, resourcemanager_1, graphics_1) {
    "use strict";
    exports.__esModule = true;
    var Player = /** @class */ (function (_super) {
        __extends(Player, _super);
        function Player(dataPath, x, y) {
            var _this = _super.call(this, "", null, x, y, 64, 64) || this;
            _this.dataPath = dataPath;
            _this.direction = 1; // forward
            resourcemanager_1.getLines(dataPath, _this, function (lines) { return lines.forEach(function (line) {
                if (line.includes(' ')) {
                    var key = line.substring(0, line.indexOf(' '));
                    line = line.substring(line.indexOf(' ') + 1);
                    switch (key) {
                        case "name":
                            {
                                _this.name = name;
                            }
                            break;
                        case "sprite": {
                            _this.sprite = new graphics_1.Sprite(line);
                        }
                    }
                }
            }); });
            _this.stepTimer = 0;
            return _this;
        }
        Player.prototype.move = function (parent, left, up, right, down) {
            var _this = this;
            var moveX = 0;
            var moveY = 0;
            if (left == right) {
                if (up != down) {
                    if (up) {
                        this.direction = 0;
                        moveY = -5;
                    }
                    else {
                        moveY = 5;
                        this.direction = 1;
                    }
                }
            }
            else if (left) {
                moveX = -5;
                this.direction = 2;
            }
            else {
                moveX = 5;
                this.direction = 3;
            }
            _super.prototype.translate.call(this, moveX, moveY, parent.solids);
            parent.world.teleports.forEach(function (teleport) {
                if (_this.x < teleport.x + teleport.width &&
                    _this.x + _this.width > teleport.x &&
                    _this.y < teleport.y + teleport.height &&
                    _this.y + _this.height > teleport.y) {
                    _this.setPosition(teleport.destX, teleport.destY);
                }
            });
            if ((moveX | moveY) == 0) {
                this.sprite.currentAnimation = 'stand' + this.direction;
                this.stepTimer = 0;
            }
            else {
                this.sprite.currentAnimation = 'walk' + this.direction;
                // Play stepping sound
                --this.stepTimer;
                if (this.stepTimer < 0) {
                    resourcemanager_1.playSound("audio/step.ogg");
                    this.stepTimer = 16;
                }
            }
        };
        /**
         * Returns -1, 0, or 1, depending on the x-direction the player faces
         */
        Player.prototype.getFacingX = function () {
            switch (this.direction) {
                case 2:
                    return -1;
                case 3:
                    return 1;
                default:
                    return 0;
            }
        };
        /**
         * Returns -1, 0, or 1, depending on the y-direction the player faces.
         */
        Player.prototype.getFacingY = function () {
            switch (this.direction) {
                case 0:
                    return -1;
                case 1:
                    return 1;
                default:
                    return 0;
            }
        };
        /**
         * Returns the x coordinate of the entity interacted with
         */
        Player.prototype.getInteractX = function () {
            return this.x + this.getFacingX() * this.width + this.width / 2;
        };
        Player.prototype.getInteractY = function () {
            return this.y + this.getFacingY() * this.height + this.height / 2;
        };
        return Player;
    }(entity_1.Entity));
    exports.Player = Player;
});
