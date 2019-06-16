
export function getLines(path: string, parent, callback: Function): void {

    let lines: Array<string> = undefined;

    fetch('./res/' + path).then(response => {
        response.body.getReader().read().then(result => {
            lines = new TextDecoder('utf-8').decode(result.value).split('\n');
            callback.apply(parent, [lines]);
        });
    }).catch(reason => {
        callback(new Array<string>());
    });

}

let music: HTMLAudioElement = null;
let musicSrc: string = null;

export function stopMusic() {
    if (music) {
        music.pause();
    }
}

export function playMusic(path: string): void {
    if (!music || path !== musicSrc) {
        stopMusic();
        
        musicSrc = path;
        music = new Audio('./res/' + path);
        music.loop = true;
        music.play();
    }
}

export function playSound(path: string): void {
    new Audio('./res/' + path).play();
}