define(["require", "exports", "./textbox"], function (require, exports, textbox_1) {
    "use strict";
    exports.__esModule = true;
    var UI = /** @class */ (function () {
        function UI() {
            var canvas = document.getElementById('canvas');
            var width = canvas.clientWidth;
            var height = canvas.clientHeight;
            this.textBox = new textbox_1.TextBox(0, height * 3 / 4, width, height / 4);
        }
        UI.prototype.update = function () {
            this.textBox.advanceChar();
        };
        UI.prototype.interact = function () {
            if (this.textBox.hasLines()) {
                this.textBox.advanceLine();
            }
            else {
                this.textBox.setVisible(false);
            }
        };
        UI.prototype.isOpen = function () {
            return this.textBox.visible;
        };
        UI.prototype.render = function (graphicsContext) {
            graphicsContext.setTransform(1, 0, 0, 1, 0, 0);
            this.textBox.render(graphicsContext);
        };
        return UI;
    }());
    exports.UI = UI;
});
