import { GameState, PlayState } from "../gamestate";

export class Section {
    parent: PlayState;
    nextSection: Section;
    interact: boolean;

    constructor(parent: PlayState) {

        this.parent = parent;
        this.nextSection = this;

        this.interact = false;
    }
    
    keyDown(event: KeyboardEvent): void {
        
    }

    keyUp(event: KeyboardEvent): void {
        
    }

    getNextSection(): Section {
        return this.nextSection;
    }

    update(): void {}

    render(graphicsContext: CanvasRenderingContext2D) {
    }
}