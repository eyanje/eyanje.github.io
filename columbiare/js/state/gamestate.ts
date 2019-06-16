import { Pattern, PImage } from '../graphics';
import { Player } from '../world/entity/player';
import { NPC } from '../world/entity/npc';
import { SetSection } from './section/setsection';
import { World, SolidObject } from '../world/world';
import { A1S1_0, A1S1_1, A1S2, A3, End, A2_0, getSection } from './section/premades';
import { Section } from './section/section';
import { UI } from '../ui/ui';
import { playMusic, getLines } from '../data/resourcemanager';

export class GameState {

    keyDown(event: KeyboardEvent): void {}
    keyUp(event: KeyboardEvent): void {}

    update(): void {}

    render(graphicsContext: CanvasRenderingContext2D): void {}

    getNextState(): GameState {
        return this;
    }
    
}

export class TitleState extends GameState {
    background: PImage;
    transition: boolean;

    constructor() {
        super();
        this.background = new PImage('./sprites/columbiare.png');
        this.transition = false;

        playMusic("audio/title.ogg");
    }

    keyUp(event: KeyboardEvent) {
        if ((event.which || event.keyCode) === 90) {
            this.transition = true;
        }
    }

    getNextState() {
        if (this.transition) {
            return new MenuState();
        } else {
            return this;
        }
    }

    render(graphicsContext: CanvasRenderingContext2D) {
        graphicsContext.clearRect(0, 0, graphicsContext.canvas.width, graphicsContext.canvas.height);
        this.background.render(graphicsContext, 0, 0, graphicsContext.canvas.width, graphicsContext.canvas.height);
    }
}

export class MenuState extends GameState {
    menuOption: number;
    transition: boolean;
    background: Pattern;

    constructor() {
        super();
        this.menuOption = 0;
        this.transition = false;
        this.background = new Pattern('./sprites/ppattern.png');
    }

    keyUp(event: KeyboardEvent) {
        if ((event.which || event.keyCode) === 90) {
            this.transition = true;
        }
    }

    keyDown(event: KeyboardEvent) {
        switch (event.which || event.keyCode) {
            case 38:
            case 40:
                this.menuOption = (this.menuOption + 1) % 2;
            break;
        }
    }

    getNextState() {
        if (this.transition) {
            switch (this.menuOption) {
                case 0: {
                    return new PlayState();
                }
                case 1: {
                    return new PlayState('save.sv');
                }
            }
        } else {
            return this;
        }
    }

    render(graphicsContext: CanvasRenderingContext2D) {
        graphicsContext.clearRect(0, 0, graphicsContext.canvas.width, graphicsContext.canvas.height);

        this.background.render(graphicsContext, 0, 0, graphicsContext.canvas.width, graphicsContext.canvas.height);

        graphicsContext.font = '108px "Gabriola"';
        graphicsContext.fillText("Main Menu", 60, 140);

        graphicsContext.beginPath();
        graphicsContext.ellipse(20, 280 + (80 * this.menuOption), 10, 10, 0, 0, 2*Math.PI);
        graphicsContext.fill();

        graphicsContext.font = '18px "default"';
        graphicsContext.fillText("New Game", 60, 280 + 12 + 4.5);
        graphicsContext.fillText("Continue", 60, 360 + 12 + 4.5);
    }
}

export class PlayState extends GameState {
    section: Section;
    
    progress: string;
    sectionName: string;

    player: Player;
    solids: Array<SolidObject>;
    world: World;
    npcs: Array<NPC>;

    path: string;

    ui: UI;

    constructor(savePath?: string) {
        super();

        this.ui = new UI();

        if (!savePath) {        
            savePath = 'save.sv';
        }
        this.path = savePath;

        this.npcs = new Array<NPC>();

        getLines(savePath, this, lines => {
            lines.forEach(line => this.parseLine(line))
            this.section = getSection(this.sectionName, this);

            this.recomputeSolids();
            this.fixData();
        });
        
    }

    parseLine(line: string): void {
        if (line.includes(' ')) {
            const token: string = line.substring(0, line.indexOf(' '));
            line = line.substring(line.indexOf(' ') + 1);
            const pieces: Array<string> = line.split(' ');
            switch (token) {
                case "player": {
                    this.player = new Player(pieces[0], parseInt(pieces[1]), parseInt(pieces[2]));
                }
                break;
                case "world": {
                    this.world = new World(line);
                }
                break;
                case "npc": {
                    
                    if (pieces.length >= 3) {
                        // status, x, y, dataPath
                        line = line.substring(line.indexOf(' ') + 1); // crop out status
                        line = line.substring(line.indexOf(' ') + 1); // crop out x
                        line = line.substring(line.indexOf(' ') + 1); // crop out y
                        if (line.indexOf(' ') == -1) {
                            line = "";
                        } else {
                            line = line.substring(line.indexOf(' ') + 1); // crop out path
                        }
                        
                        this.npcs.push(new NPC(
                            pieces[0],
                            pieces[3],
                            parseInt(pieces[1]),
                            parseInt(pieces[2]),
                            line.split(' ')));
                    } else {
                        this.npcs.push(new NPC(
                            pieces[0],
                            line.substring(line.indexOf(' ') + 1)));
                    }
                }
                break;
                case "progress": {
                    this.progress = line;
                }
                break;
                case "section": {
                    this.sectionName = line;
                }
                break;
            }
        }
    }

    fixData(): void {
        if (!this.player) {
            console.warn("Player is null");
            this.player = new Player("entities/columbiare", 0, 0);
        }
        if (!this.world) {
            console.warn("World is null");
            this.world = new World("world/world.wld");
        }
        if (!this.progress) {
            this.progress = "a1s1";
        }
        if (!this.sectionName) {
            console.warn("No section specified in save");
            this.sectionName = "com.glowingpigeon.columbiare.section.premade.A1S1_0";
        }
    }

    getNPCByName(name: string): NPC {
        let named: NPC = null;
        this.npcs.forEach(npc => {
            if (name == npc.name) {
                named = npc;
            }
        });
        return named;
    }

    setSection(section: Section): void {
        this.sectionName = section.constructor.name;
    }

    setProgress(progress: string): void {
        this.progress = progress;
    }

    recomputeSolids(): void {
        if (this.world) {
            this.solids = [...this.world.solids, ...this.npcs];
        }
    }

    keyDown(event: KeyboardEvent): void {
        this.section.keyDown(event);
    }

    keyUp(event: KeyboardEvent): void {
        this.section.keyUp(event);
    }

    update() {
        if (this.section) {
            this.section.update();
        }

        this.ui.update();
        
        this.npcs.forEach((npc) => {
            npc.update();
        });

        if (this.section) {
            this.section = this.section.getNextSection();
        }
    }

    render(graphicsContext: CanvasRenderingContext2D) {
        graphicsContext.setTransform(1, 0, 0, 1, 0, 0);
    
        graphicsContext.clearRect(0, 0, graphicsContext.canvas.width, graphicsContext.canvas.height);
        graphicsContext.fillStyle = 'rgb(6, 0, 12)';
        graphicsContext.fillRect(0, 0, graphicsContext.canvas.width, graphicsContext.canvas.height);
        
        if (this.section) {
            this.section.render(graphicsContext);
        }

        graphicsContext.setTransform(1, 0, 0, 1, 0, 0);
        this.ui.render(graphicsContext);
    }

}