import { TitleState, GameState } from "./state/gamestate";

(() => {

    let canvas = document.getElementById('canvas') as HTMLCanvasElement;

    const graphicsContext = canvas.getContext('2d');
    
    let state = new TitleState() as GameState;

    document.addEventListener("keyup", (event: KeyboardEvent) => { state.keyUp(event) });
    document.addEventListener("keydown", (event: KeyboardEvent) => { state.keyDown(event) });

    function loop() {
        state.update();
        state.render(graphicsContext);

        state = state.getNextState();

        //setTimeout(loop, 0);
    }

    //loop();
    setInterval(loop, 16);
})();