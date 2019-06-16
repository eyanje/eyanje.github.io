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
define(["require", "exports", "./section", "../../data/resourcemanager", "./premades"], function (require, exports, section_1, resourcemanager_1, premades_1) {
    "use strict";
    exports.__esModule = true;
    var SetSection = /** @class */ (function (_super) {
        __extends(SetSection, _super);
        function SetSection(parent, path) {
            var _this = _super.call(this, parent) || this;
            _this.actions = new Array();
            ;
            resourcemanager_1.getLines(path, _this, function (lines) { return _this.actions = lines.slice().reverse(); });
            _this.cameraX = parent.player.x + parent.player.width / 2;
            _this.cameraY = parent.player.y + parent.player.height / 2;
            _this.nextSection = _this;
            return _this;
        }
        SetSection.prototype.keyDown = function (event) {
            if (event.keyCode == 90) {
                this.interact = true;
            }
        };
        SetSection.prototype.update = function () {
            if (this.actions.length > 0) {
                var action = this.actions.pop();
                var type = void 0;
                var data = void 0;
                if (action.includes(' ')) {
                    type = action.substring(0, action.indexOf(' '));
                    data = action.substring(action.indexOf(' ') + 1).trim();
                }
                else {
                    type = action;
                    data = "";
                }
                switch (type) {
                    case "section":
                        {
                            this.nextSection = premades_1.getSection(data, this.parent);
                            if (!this.nextSection) {
                                this.nextSection = this;
                            }
                        }
                        break;
                    case "wait":
                        {
                            var len = parseInt(data);
                            if (len > 0) {
                                this.actions.push("wait " + (parseInt(data) - 1));
                            }
                        }
                        break;
                    case "pan":
                        {
                            var tokens = data.split(' ');
                            var panX = parseInt(tokens[0]);
                            var panY = parseInt(tokens[1]);
                            var speed = 1;
                            // Load a new speed
                            if (tokens.length >= 3) {
                                speed = parseInt(tokens[2]);
                            }
                            if (panX < 0) {
                                this.cameraX -= speed;
                                panX += speed;
                                // Check for overshooting
                                if (panX > 0) {
                                    this.cameraX += panX;
                                    panX = 0;
                                }
                            }
                            else if (panX > 0) {
                                this.cameraX += speed;
                                panX -= speed;
                                // Check for overshooting
                                if (panX < 0) {
                                    this.cameraX += panX;
                                    panX = 0;
                                }
                            }
                            if (panY < 0) {
                                this.cameraY -= speed;
                                panY += speed;
                                // Check for overshooting
                                if (panY > 0) {
                                    this.cameraY += panY;
                                    panY = 0;
                                }
                            }
                            else if (panY > 0) {
                                this.cameraY += speed;
                                panY -= speed;
                                // Check for overshooting
                                if (panY < 0) {
                                    this.cameraY += panY;
                                    panY = 0;
                                }
                            }
                            if ((panX | panY) != 0) {
                                this.actions.push("pan " + panX + ' ' + panY + ' ' + speed);
                            }
                        }
                        break;
                    case "panto":
                        {
                            var tokens = data.split(' ');
                            var panX = parseInt(tokens[0]);
                            var panY = parseInt(tokens[1]);
                            var speed = 1;
                            // Load a new speed
                            if (tokens.length >= 3) {
                                speed = parseInt(tokens[2]);
                            }
                            this.actions.push("pan " + (panX - this.cameraX) + ' ' + (panY - this.cameraY) + ' ' + speed);
                        }
                        break;
                    case "tp":
                        {
                            var tokens = data.split(' ');
                            var tpX = parseInt(tokens[0]);
                            var tpY = parseInt(tokens[1]);
                            this.cameraX = tpX;
                            this.cameraY = tpY;
                        }
                        break;
                    case "npc":
                        {
                            var name_1 = data.substring(0, data.indexOf(' '));
                            data = data.substring(data.indexOf(' ') + 1);
                            var npc = this.parent.getNPCByName(name_1);
                            var subAction = data.substring(0, data.indexOf(' '));
                            data = data.substring(data.indexOf(' ') + 1);
                            switch (subAction) {
                                case "move": {
                                    var tokens = data.split(' ');
                                    var moveX = parseInt(tokens[0]);
                                    var moveY = parseInt(tokens[1]);
                                    var speed = 1;
                                    if (tokens.length >= 3) {
                                        speed = parseInt(tokens[2]);
                                    }
                                    // Load a new speed
                                    if (tokens.length >= 3) {
                                        speed = parseInt(tokens[2]);
                                    }
                                    if (moveX < 0) {
                                        npc.translate(-speed, 0, this.parent.world.solids);
                                        moveX += speed;
                                        // Check for overshooting
                                        if (moveX > 0) {
                                            npc.translate(moveX, 0, this.parent.world.solids);
                                            moveX = 0;
                                        }
                                    }
                                    else if (moveX > 0) {
                                        npc.translate(speed, 0, this.parent.world.solids);
                                        moveX -= speed;
                                        // Check for overshooting
                                        if (moveX < 0) {
                                            npc.translate(moveX, 0, this.parent.world.solids);
                                            moveX = 0;
                                        }
                                    }
                                    if (moveY < 0) {
                                        npc.translate(0, -speed, this.parent.world.solids);
                                        moveY += speed;
                                        // Check for overshooting
                                        if (moveY > 0) {
                                            npc.translate(moveY, 0, this.parent.world.solids);
                                            moveY = 0;
                                        }
                                    }
                                    else if (moveY > 0) {
                                        npc.translate(0, speed, this.parent.world.solids);
                                        moveY -= speed;
                                        // Check for overshooting
                                        if (moveY < 0) {
                                            npc.translate(moveY, 0, this.parent.world.solids);
                                            moveY = 0;
                                        }
                                    }
                                    if ((moveX | moveY) != 0) {
                                        this.actions.push("npc move " + moveX + ' ' + moveY + ' ' + speed);
                                    }
                                }
                            }
                        }
                        break;
                    case "text":
                        {
                            if (data.trim().length > 0) {
                                // Keep going through old text
                                if (this.interact) {
                                    this.parent.ui.interact();
                                }
                                if (this.parent.ui.isOpen()) {
                                    this.actions.push("text");
                                }
                            }
                            else {
                                // Add new text
                                var name_2 = data.substring(0, data.indexOf(' '));
                                var text = data.substring(data.indexOf(' ') + 1);
                                this.parent.ui.textBox.addAdjustedLine(name_2, text);
                                this.actions.push("text");
                            }
                        }
                        break;
                    case "#":
                        break;
                    default:
                        {
                            console.info("Unrecognized action " + action);
                        }
                        break;
                }
            }
            this.interact = false;
            _super.prototype.update.call(this);
        };
        SetSection.prototype.render = function (graphicsContext) {
            var _this = this;
            graphicsContext.setTransform(1, 0, 0, 1, graphicsContext.canvas.width / 2 - this.cameraX, graphicsContext.canvas.height / 2 - this.cameraY);
            this.parent.world.render(graphicsContext, this.cameraX, this.cameraY);
            this.parent.npcs.forEach(function (npc) {
                npc.render(graphicsContext, _this.cameraX, _this.cameraY);
            });
            this.parent.player.render(graphicsContext, this.cameraX, this.cameraY);
        };
        return SetSection;
    }(section_1.Section));
    exports.SetSection = SetSection;
});
