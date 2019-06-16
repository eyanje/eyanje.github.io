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
define(["require", "exports", "./section"], function (require, exports, section_1) {
    "use strict";
    exports.__esModule = true;
    var PlaySection = /** @class */ (function (_super) {
        __extends(PlaySection, _super);
        function PlaySection(parent) {
            var _this = _super.call(this, parent) || this;
            _this.solids = new Array();
            _this.solids = parent.npcs.concat(parent.world.solids);
            _this.moves = [false, false, false, false];
            return _this;
        }
        PlaySection.prototype.keyDown = function (event) {
            switch (event.keyCode) {
                case 37:
                    {
                        this.moves[0] = true;
                    }
                    break;
                case 38:
                    {
                        this.moves[1] = true;
                    }
                    break;
                case 39:
                    {
                        this.moves[2] = true;
                    }
                    break;
                case 40:
                    {
                        this.moves[3] = true;
                    }
                    break;
                case 90:
                    this.interact = true;
                default:
                    // Do nothing
                    break;
            }
        };
        PlaySection.prototype.keyUp = function (event) {
            switch (event.keyCode) {
                case 37:
                    {
                        this.moves[0] = false;
                    }
                    break;
                case 38:
                    {
                        this.moves[1] = false;
                    }
                    break;
                case 39:
                    {
                        this.moves[2] = false;
                    }
                    break;
                case 40:
                    {
                        this.moves[3] = false;
                    }
                    break;
                default:
                    // Do nothing
                    break;
            }
        };
        PlaySection.prototype.update = function () {
            var _this = this;
            if (!this.parent.ui.isOpen()) {
                this.parent.player.move(this.parent, this.moves[0], this.moves[1], this.moves[2], this.moves[3]);
            }
            _super.prototype.update.call(this);
            if (this.interact) {
                if (this.parent.ui.isOpen()) {
                    this.parent.ui.interact();
                }
                else {
                    // Add new lines
                    var interactX_1 = this.parent.player.getInteractX();
                    var interactY_1 = this.parent.player.getInteractY();
                    this.parent.npcs.some(function (npc) {
                        if (npc.contains(interactX_1, interactY_1)) {
                            _this.parent.ui.textBox.addNPCLines(npc, _this.parent.progress);
                            // Only add lines for the first NPC you find
                            return true;
                        }
                    });
                    this.parent.world.solids.some(function (solid) {
                        if (solid.contains(interactX_1, interactY_1) && solid.description) {
                            // Add a line for an abstacle
                            _this.parent.ui.textBox.addAdjustedLine("Columbiare", solid.description);
                            return true;
                        }
                    });
                }
            }
            this.interact = false;
        };
        PlaySection.prototype.render = function (graphicsContext) {
            var playerX = this.parent.player.x + this.parent.player.width / 2;
            var playerY = this.parent.player.y + this.parent.player.height / 2;
            graphicsContext.setTransform(1, 0, 0, 1, graphicsContext.canvas.width / 2 - playerX, graphicsContext.canvas.height / 2 - playerY);
            this.parent.world.render(graphicsContext, playerX, playerY);
            this.parent.npcs.forEach(function (npc) {
                npc.render(graphicsContext, playerX, playerY);
            });
            this.parent.player.render(graphicsContext, playerX, playerY);
        };
        return PlaySection;
    }(section_1.Section));
    exports.PlaySection = PlaySection;
});
