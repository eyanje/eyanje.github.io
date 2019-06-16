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
define(["require", "exports", "../graphics", "../world/entity/player", "../world/entity/npc", "../world/world", "./section/premades", "../ui/ui", "../data/resourcemanager"], function (require, exports, graphics_1, player_1, npc_1, world_1, premades_1, ui_1, resourcemanager_1) {
    "use strict";
    exports.__esModule = true;
    var GameState = /** @class */ (function () {
        function GameState() {
        }
        GameState.prototype.keyDown = function (event) { };
        GameState.prototype.keyUp = function (event) { };
        GameState.prototype.update = function () { };
        GameState.prototype.render = function (graphicsContext) { };
        GameState.prototype.getNextState = function () {
            return this;
        };
        return GameState;
    }());
    exports.GameState = GameState;
    var TitleState = /** @class */ (function (_super) {
        __extends(TitleState, _super);
        function TitleState() {
            var _this = _super.call(this) || this;
            _this.background = new graphics_1.PImage('./sprites/columbiare.png');
            _this.transition = false;
            resourcemanager_1.playMusic("audio/title.ogg");
            return _this;
        }
        TitleState.prototype.keyUp = function (event) {
            if ((event.which || event.keyCode) === 90) {
                this.transition = true;
            }
        };
        TitleState.prototype.getNextState = function () {
            if (this.transition) {
                return new MenuState();
            }
            else {
                return this;
            }
        };
        TitleState.prototype.render = function (graphicsContext) {
            graphicsContext.clearRect(0, 0, graphicsContext.canvas.width, graphicsContext.canvas.height);
            this.background.render(graphicsContext, 0, 0, graphicsContext.canvas.width, graphicsContext.canvas.height);
        };
        return TitleState;
    }(GameState));
    exports.TitleState = TitleState;
    var MenuState = /** @class */ (function (_super) {
        __extends(MenuState, _super);
        function MenuState() {
            var _this = _super.call(this) || this;
            _this.menuOption = 0;
            _this.transition = false;
            _this.background = new graphics_1.Pattern('./sprites/ppattern.png');
            return _this;
        }
        MenuState.prototype.keyUp = function (event) {
            if ((event.which || event.keyCode) === 90) {
                this.transition = true;
            }
        };
        MenuState.prototype.keyDown = function (event) {
            switch (event.which || event.keyCode) {
                case 38:
                case 40:
                    this.menuOption = (this.menuOption + 1) % 2;
                    break;
            }
        };
        MenuState.prototype.getNextState = function () {
            if (this.transition) {
                switch (this.menuOption) {
                    case 0: {
                        return new PlayState();
                    }
                    case 1: {
                        return new PlayState('save.sv');
                    }
                }
            }
            else {
                return this;
            }
        };
        MenuState.prototype.render = function (graphicsContext) {
            graphicsContext.clearRect(0, 0, graphicsContext.canvas.width, graphicsContext.canvas.height);
            this.background.render(graphicsContext, 0, 0, graphicsContext.canvas.width, graphicsContext.canvas.height);
            graphicsContext.font = '108px "Gabriola"';
            graphicsContext.fillText("Main Menu", 60, 140);
            graphicsContext.beginPath();
            graphicsContext.ellipse(20, 280 + (80 * this.menuOption), 10, 10, 0, 0, 2 * Math.PI);
            graphicsContext.fill();
            graphicsContext.font = '18px "default"';
            graphicsContext.fillText("New Game", 60, 280 + 12 + 4.5);
            graphicsContext.fillText("Continue", 60, 360 + 12 + 4.5);
        };
        return MenuState;
    }(GameState));
    exports.MenuState = MenuState;
    var PlayState = /** @class */ (function (_super) {
        __extends(PlayState, _super);
        function PlayState(savePath) {
            var _this = _super.call(this) || this;
            _this.ui = new ui_1.UI();
            if (!savePath) {
                savePath = 'save.sv';
            }
            _this.path = savePath;
            _this.npcs = new Array();
            resourcemanager_1.getLines(savePath, _this, function (lines) {
                lines.forEach(function (line) { return _this.parseLine(line); });
                _this.section = premades_1.getSection(_this.sectionName, _this);
                _this.recomputeSolids();
                _this.fixData();
            });
            return _this;
        }
        PlayState.prototype.parseLine = function (line) {
            if (line.includes(' ')) {
                var token = line.substring(0, line.indexOf(' '));
                line = line.substring(line.indexOf(' ') + 1);
                var pieces = line.split(' ');
                switch (token) {
                    case "player":
                        {
                            this.player = new player_1.Player(pieces[0], parseInt(pieces[1]), parseInt(pieces[2]));
                        }
                        break;
                    case "world":
                        {
                            this.world = new world_1.World(line);
                        }
                        break;
                    case "npc":
                        {
                            if (pieces.length >= 3) {
                                // status, x, y, dataPath
                                line = line.substring(line.indexOf(' ') + 1); // crop out status
                                line = line.substring(line.indexOf(' ') + 1); // crop out x
                                line = line.substring(line.indexOf(' ') + 1); // crop out y
                                if (line.indexOf(' ') == -1) {
                                    line = "";
                                }
                                else {
                                    line = line.substring(line.indexOf(' ') + 1); // crop out path
                                }
                                this.npcs.push(new npc_1.NPC(pieces[0], pieces[3], parseInt(pieces[1]), parseInt(pieces[2]), line.split(' ')));
                            }
                            else {
                                this.npcs.push(new npc_1.NPC(pieces[0], line.substring(line.indexOf(' ') + 1)));
                            }
                        }
                        break;
                    case "progress":
                        {
                            this.progress = line;
                        }
                        break;
                    case "section":
                        {
                            this.sectionName = line;
                        }
                        break;
                }
            }
        };
        PlayState.prototype.fixData = function () {
            if (!this.player) {
                console.warn("Player is null");
                this.player = new player_1.Player("entities/columbiare", 0, 0);
            }
            if (!this.world) {
                console.warn("World is null");
                this.world = new world_1.World("world/world.wld");
            }
            if (!this.progress) {
                this.progress = "a1s1";
            }
            if (!this.sectionName) {
                console.warn("No section specified in save");
                this.sectionName = "section/premade/A1S1_0";
            }
        };
        PlayState.prototype.getNPCByName = function (name) {
            var named = null;
            this.npcs.forEach(function (npc) {
                if (name == npc.name) {
                    named = npc;
                }
            });
            return named;
        };
        PlayState.prototype.setSection = function (section) {
            this.sectionName = section.constructor.name;
        };
        PlayState.prototype.setProgress = function (progress) {
            this.progress = progress;
        };
        PlayState.prototype.recomputeSolids = function () {
            if (this.world) {
                this.solids = this.world.solids.concat(this.npcs);
            }
        };
        PlayState.prototype.keyDown = function (event) {
            this.section.keyDown(event);
        };
        PlayState.prototype.keyUp = function (event) {
            this.section.keyUp(event);
        };
        PlayState.prototype.update = function () {
            if (this.section) {
                this.section.update();
            }
            this.npcs.forEach(function (npc) {
                npc.update();
            });
            if (this.section) {
                this.section = this.section.getNextSection();
            }
        };
        PlayState.prototype.render = function (graphicsContext) {
            graphicsContext.setTransform(1, 0, 0, 1, 0, 0);
            graphicsContext.clearRect(0, 0, graphicsContext.canvas.width, graphicsContext.canvas.height);
            graphicsContext.fillStyle = 'rgb(6, 0, 12)';
            graphicsContext.fillRect(0, 0, graphicsContext.canvas.width, graphicsContext.canvas.height);
            if (this.section) {
                this.section.render(graphicsContext);
            }
            graphicsContext.setTransform(1, 0, 0, 1, 0, 0);
            this.ui.render(graphicsContext);
        };
        return PlayState;
    }(GameState));
    exports.PlayState = PlayState;
});
