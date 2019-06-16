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
define(["require", "exports", "./entity", "../../data/resourcemanager", "../../graphics", "./dialogue/dialogue"], function (require, exports, entity_1, resourcemanager_1, graphics_1, dialogue_1) {
    "use strict";
    exports.__esModule = true;
    var NPC = /** @class */ (function (_super) {
        __extends(NPC, _super);
        function NPC(status, dataPath, x, y, data) {
            var _this = _super.call(this, "NPC", null, 0, 0, 16, 16) || this;
            _this.status = status;
            _this.dataPath = dataPath;
            _this.readFile(dataPath);
            _this.state = null;
            _this.x = x;
            _this.y = y;
            if (data) {
                _this.data = data.slice();
            }
            return _this;
        }
        NPC.prototype.readFile = function (path) {
            var _this = this;
            resourcemanager_1.getLines(path, this, function (lines) { return lines.forEach(function (line) {
                if (line.includes(' ')) {
                    var propertyName = line.substring(0, line.indexOf(' '));
                    line = line.substring(line.indexOf(' ') + 1);
                    switch (propertyName) {
                        case "name":
                            {
                                _this.name = line;
                            }
                            break;
                        case "bounds":
                            {
                                var tokens = line.split(' ');
                                _this.x = parseInt(tokens[0]);
                                _this.y = parseInt(tokens[1]);
                                if (tokens.length >= 3) {
                                    _this.width = parseInt(tokens[2]);
                                }
                                else {
                                    _this.width = 64;
                                }
                                if (tokens.length >= 4) {
                                    _this.height = parseInt(tokens[3]);
                                }
                                else {
                                    _this.height = 64;
                                }
                            }
                            break;
                        case "sprite":
                            {
                                _this.sprite = new graphics_1.Sprite(line);
                            }
                            break;
                        case "dialogue":
                            {
                                _this.dialogueSet = new dialogue_1.DialogueSet(line, _this);
                            }
                            break;
                        case "#":
                            break;
                        default: {
                            console.warn("Invaid npc property " + propertyName + " in " + path);
                        }
                    }
                }
            }); });
        };
        NPC.prototype.update = function () {
            if (this.data.length > 0) {
                var first = this.data.pop();
                var tokens = first.split(' ');
                var head = tokens[0];
                var body = first.substring(first.indexOf(' ') + 1);
                if (head && head.length > 0) {
                    switch (head) {
                        case "move":
                            {
                                var x = parseInt(tokens[1]);
                                var y = parseInt(tokens[2]);
                                var speed = 4;
                                if (tokens.length >= 4) {
                                    speed = parseInt(tokens[3]);
                                }
                                var traX = 0;
                                var traY = 0;
                                if (x > 0) {
                                    traX = speed;
                                    x -= speed;
                                    if (x < 0) {
                                        traX += x;
                                        x = 0;
                                    }
                                }
                                else if (x < 0) {
                                    traX = -speed;
                                    if (x > 0) {
                                        traX += x;
                                        x = 0;
                                    }
                                }
                                if (y > 0) {
                                    traY = speed;
                                    y -= speed;
                                    if (y < 0) {
                                        traY += y;
                                        y = 0;
                                    }
                                }
                                else if (y < 0) {
                                    traY = -speed;
                                    y += speed;
                                    if (y > 0) {
                                        traY += y;
                                        y = 0;
                                    }
                                }
                                this.translate(traX, traY);
                                if (x != 0 || y != 0) {
                                    this.data.push("move " + x + ' ' + y + ' ' + speed);
                                }
                            }
                            break;
                        case "anim":
                            {
                                this.sprite.currentAnimation = body;
                            }
                            break;
                        default:
                            this.data.push(first);
                            break;
                    }
                }
            }
            switch (status) {
                case "stand":
                    {
                        // TODO standing
                    }
                    break;
                case "wander":
                    {
                        // TODO wandering
                    }
                    break;
                case "walk": {
                }
            }
            this.sprite.update();
        };
        NPC.prototype.toString = function () {
            return "npc " + this.status + ' ' + this.state + ' ' + this.dataPath;
        };
        return NPC;
    }(entity_1.Entity));
    exports.NPC = NPC;
});
