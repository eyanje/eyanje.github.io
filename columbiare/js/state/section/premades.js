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
define(["require", "exports", "./setsection", "../../data/resourcemanager", "./playsection", "./section"], function (require, exports, setsection_1, resourcemanager_1, playsection_1, section_1) {
    "use strict";
    exports.__esModule = true;
    var A1S1_0 = /** @class */ (function (_super) {
        __extends(A1S1_0, _super);
        function A1S1_0(parent) {
            var _this = _super.call(this, parent, "sections/a1s1-0.set") || this;
            resourcemanager_1.playMusic("audio/act1.ogg");
            parent.recomputeSolids();
            return _this;
        }
        return A1S1_0;
    }(setsection_1.SetSection));
    exports.A1S1_0 = A1S1_0;
    var A1S1_1 = /** @class */ (function (_super) {
        __extends(A1S1_1, _super);
        function A1S1_1(parent) {
            var _this = _super.call(this, parent) || this;
            parent.recomputeSolids();
            _this.transition = false;
            resourcemanager_1.playMusic("audio/act1.ogg");
            return _this;
        }
        A1S1_1.prototype.update = function () {
            _super.prototype.update.call(this);
            if (this.parent.player.x > 4096 && this.parent.player.y <= 468) {
                this.transition = true;
                this.parent.progress = "a1s2";
            }
        };
        A1S1_1.prototype.getNextSection = function () {
            if (this.transition) {
                return new A1S2(this.parent);
            }
            return this;
        };
        return A1S1_1;
    }(playsection_1.PlaySection));
    exports.A1S1_1 = A1S1_1;
    var A1S2 = /** @class */ (function (_super) {
        __extends(A1S2, _super);
        function A1S2(parent) {
            var _this = _super.call(this, parent) || this;
            _this.parent.getNPCByName("Amia").setPosition(5024, 3264);
            _this.parent.recomputeSolids();
            resourcemanager_1.playMusic("audio/act1.ogg");
            if (_this.parent.player.y > 1024) {
                // Play act 2 later
            }
            _this.transition = false;
            return _this;
        }
        A1S2.prototype.update = function () {
            _super.prototype.update.call(this);
            var data = this.parent.getNPCByName("Fara").data;
            //System.out.println(data);
            if (data.length > 0 && data[0] === 'received') {
                this.transition = true;
            }
        };
        A1S2.prototype.getNextSection = function () {
            if (this.transition) {
                return new A2_0(this.parent);
            }
            return this;
        };
        return A1S2;
    }(playsection_1.PlaySection));
    exports.A1S2 = A1S2;
    var A2_0 = /** @class */ (function (_super) {
        __extends(A2_0, _super);
        function A2_0(parent) {
            var _this = _super.call(this, parent) || this;
            // TODO Auto-generated constructor stub
            _this.parent.getNPCByName("Amia").setPosition(6114, 464);
            _this.parent.getNPCByName("Amia").getSprite().setCurrentAnimation("dead");
            _this.parent.getNPCByName("Amia").data.length = 0;
            resourcemanager_1.playMusic("audio/act1.ogg");
            _this.parent.setProgress("a2s1");
            _this.transition = false;
            return _this;
        }
        A2_0.prototype.update = function () {
            _super.prototype.update.call(this);
            var data = this.parent.getNPCByName("Amia").getDataContainer();
            //System.out.println(data);
            if (data.length > 0 && data[0] === 'dead') {
                this.transition = true;
            }
        };
        A2_0.prototype.getNextSection = function () {
            if (this.transition) {
                return new A3(this.parent);
            }
            return this;
        };
        return A2_0;
    }(playsection_1.PlaySection));
    exports.A2_0 = A2_0;
    var A3 = /** @class */ (function (_super) {
        __extends(A3, _super);
        function A3(parent) {
            var _this = _super.call(this, parent) || this;
            resourcemanager_1.stopMusic();
            _this.parent.setProgress("a3s1");
            _this.parent.getNPCByName("Fara").data.length = 0;
            return _this;
        }
        A3.prototype.update = function () {
            _super.prototype.update.call(this);
            var data = this.parent.getNPCByName("Fara").getDataContainer();
            //System.out.println(data);
            if (data.length > 0 && data[0] === 'reveal') {
                this.transition = true;
            }
        };
        A3.prototype.getNextSection = function () {
            if (this.transition) {
                return new End(this.parent);
            }
            return this;
        };
        return A3;
    }(playsection_1.PlaySection));
    exports.A3 = A3;
    var End = /** @class */ (function (_super) {
        __extends(End, _super);
        function End(parent) {
            var _this = _super.call(this, parent) || this;
            resourcemanager_1.playMusic("audio/meme.ogg");
            return _this;
        }
        End.prototype.render = function (graphicsContext) {
            graphicsContext.setTransform(1, 0, 0, 1, 0, 0);
            graphicsContext.fillStyle = 'white';
            graphicsContext.font = '48px "Gabriola"';
            graphicsContext.fillText("You're an idiot.", graphicsContext.canvas.width / 2, graphicsContext.canvas.height / 2);
        };
        return End;
    }(section_1.Section));
    exports.End = End;
    function getSection(sectionName, parent) {
        switch (sectionName) {
            case 'com.glowingpigeon.columbiare.state.premade.A1S1_0':
                return new A1S1_0(parent);
            case 'com.glowingpigeon.columbiare.state.premade.A1S1_1':
                return new A1S1_1(parent);
            case 'com.glowingpigeon.columbiare.state.premade.A1S2':
                return new A1S2(parent);
            case 'com.glowingpigeon.columbiare.state.premade.A2':
                return new A2_0(parent);
            case 'com.glowingpigeon.columbiare.state.premade.A3':
                return new A3(parent);
            case 'com.glowingpigeon.columbiare.state.premade.End':
                return new End(parent);
            default:
                return new A1S1_0(parent);
        }
    }
    exports.getSection = getSection;
});
