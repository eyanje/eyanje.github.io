define(["require", "exports", "./state/gamestate"], function (require, exports, gamestate_1) {
    "use strict";
    exports.__esModule = true;
    (function () {
        var canvas = document.getElementById('canvas');
        var graphicsContext = canvas.getContext('2d');
        var state = new gamestate_1.TitleState();
        document.addEventListener("keyup", function (event) { state.keyUp(event); });
        document.addEventListener("keydown", function (event) { state.keyDown(event); });
        function loop() {
            state.update();
            state.render(graphicsContext);
            state = state.getNextState();
            //setTimeout(loop, 0);
        }
        //loop();
        setInterval(loop, 16);
    })();
});
