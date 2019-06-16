define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var Section = /** @class */ (function () {
        function Section(parent) {
            this.parent = parent;
            this.nextSection = this;
            this.interact = false;
        }
        Section.prototype.keyDown = function (event) {
        };
        Section.prototype.keyUp = function (event) {
        };
        Section.prototype.getNextSection = function () {
            return this.nextSection;
        };
        Section.prototype.update = function () { };
        Section.prototype.render = function (graphicsContext) {
        };
        return Section;
    }());
    exports.Section = Section;
});
