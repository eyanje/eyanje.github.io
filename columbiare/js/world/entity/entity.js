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
define(["require", "exports", "../world"], function (require, exports, world_1) {
    "use strict";
    exports.__esModule = true;
    /**
     * An entity is anything which can move around.
     * Basically anything alive.
     */
    var Entity = /** @class */ (function (_super) {
        __extends(Entity, _super);
        function Entity(name, spritePath, x, y, width, height) {
            var _this = _super.call(this, spritePath, x, y, width, height, null) || this;
            _this.name = name;
            _this.data = new Array();
            return _this;
        }
        Entity.prototype.collides = function (solids) {
            var _this = this;
            var collides = 0;
            solids.forEach(function (solid) {
                // First check for collision
                if (solid && _this !== solid
                    && solid.x <= _this.x + _this.width
                    && solid.y <= _this.y + _this.height
                    && solid.x + solid.width >= _this.x
                    && solid.y + solid.height >= _this.y) {
                    var collideWidth = Math.min(solid.x + solid.width, _this.x + _this.width) - Math.max(solid.x, _this.x);
                    var collideHeight = Math.min(solid.y + solid.height, _this.y + _this.height) - Math.max(solid.y, _this.y);
                    if ((collideWidth | collideHeight) != 0) {
                        // Move by y axis
                        if (Math.abs(collideWidth) >= Math.abs(collideHeight)) {
                            if (solid.y < _this.y) {
                                collides = collides | 1;
                            }
                            else if (solid.y > _this.y) {
                                collides = collides | 2;
                            }
                        }
                        // Move by x axis
                        if (Math.abs(collideWidth) <= Math.abs(collideHeight)) {
                            if (solid.x < _this.x) {
                                collides = collides | 4;
                            }
                            else if (solid.x > _this.x) {
                                collides = collides | 8;
                            }
                        }
                    }
                }
            });
            return collides;
        };
        Entity.prototype.translate = function (x, y, solids) {
            // Records possible movement as 0bxy
            var possible = 3;
            if (solids) {
                do { // Should eventually reach 0
                    possible = 3;
                    if (x > 0 // Move right
                        && ((this.collides(solids) & 8) == 0)) {
                        ++this.x;
                        --x;
                    }
                    else if (x < 0 // Move left
                        && ((this.collides(solids) & 4) == 0)) {
                        --this.x;
                        ++x;
                    }
                    else {
                        possible = possible & 1;
                    }
                    if (y > 0 // Move down
                        && ((this.collides(solids) & 2) == 0)) {
                        ++this.y;
                        --y;
                    }
                    else if (y < 0 // Moving up
                        && ((this.collides(solids) & 1) == 0)) {
                        --this.y;
                        ++y;
                    }
                    else {
                        possible = possible & 2;
                    }
                } while (possible != 0);
            }
            else {
                this.x += x;
                this.y += y;
            }
        };
        Entity.prototype.setPosition = function (x, y) {
            this.x = x;
            this.y = y;
        };
        Entity.prototype.render = function (graphicsContext, perspectiveX, perspectiveY) {
            this.sprite.update();
            this.sprite.render(graphicsContext, this.x, this.y, this.width, this.height, perspectiveX, perspectiveY);
        };
        Entity.prototype.getSprite = function () {
            return this.sprite;
        };
        Entity.prototype.getDataContainer = function () {
            return this.data;
        };
        return Entity;
    }(world_1.SolidObject));
    exports.Entity = Entity;
});
