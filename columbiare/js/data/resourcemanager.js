define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    function getLines(path, parent, callback) {
        var lines = undefined;
        fetch('./res/' + path).then(function (response) {
            response.body.getReader().read().then(function (result) {
                lines = new TextDecoder('utf-8').decode(result.value).split('\n');
                callback.apply(parent, [lines]);
            });
        })["catch"](function (reason) {
            callback(new Array());
        });
    }
    exports.getLines = getLines;
    var music = null;
    var musicSrc = null;
    function stopMusic() {
        if (music) {
            music.pause();
        }
    }
    exports.stopMusic = stopMusic;
    function playMusic(path) {
        if (!music || path !== musicSrc) {
            stopMusic();
            musicSrc = path;
            music = new Audio('./res/' + path);
            music.loop = true;
            music.play();
        }
    }
    exports.playMusic = playMusic;
    function playSound(path) {
        new Audio('./res/' + path).play();
    }
    exports.playSound = playSound;
});
