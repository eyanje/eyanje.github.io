import { PlayState } from "../gamestate";
import { SolidObject } from "../../world/world";
import { Section } from "./section";

export class PlaySection extends Section {
    // A collection to hold existing solids
    solids: Array<SolidObject>;
    trigger: Array<string>;
    moves: Array<boolean>;

    constructor(parent: PlayState) {
        super(parent);

        this.solids = new Array<SolidObject>();
        this.solids = [...parent.npcs, ...parent.world.solids];

        this.moves = [ false, false, false, false ];
    }

    keyDown(event: KeyboardEvent): void {
        switch (event.keyCode) {
            case 37: {
                this.moves[0] = true;
            }
            break;
            case 38: {
                this.moves[1] = true;
            }
            break;
            case 39: {
                this.moves[2] = true;
            }
            break;
            case 40: {
                this.moves[3] = true;
            }
            break;
            case 90:
                this.interact = true;
            default:
            // Do nothing
            break;
        }
    }
    keyUp(event: KeyboardEvent): void {
        switch (event.keyCode) {
            case 37: {
                this.moves[0] = false;
            }
            break;
            case 38: {
                this.moves[1] = false;
            }
            break;
            case 39: {
                this.moves[2] = false;
            }
            break;
            case 40: {
                this.moves[3] = false;
            }
            break;
            default:
            // Do nothing
            break;
        }
    }

    update() {
        if (!this.parent.ui.isOpen()) {
            this.parent.player.move(this.parent, this.moves[0], this.moves[1], this.moves[2], this.moves[3]);
        }
        super.update();
        
        if (this.interact) {
            if (this.parent.ui.isOpen()) {
                this.parent.ui.interact();
            } else {
                // Add new lines
                const interactX = this.parent.player.getInteractX();
                const interactY = this.parent.player.getInteractY();
    
                this.parent.npcs.some(npc => {
                    if (npc.contains(interactX, interactY)) {
                        this.parent.ui.textBox.addNPCLines(npc, this.parent.progress);
                        // Only add lines for the first NPC you find
                        return true;
                    }
                });
                this.parent.world.solids.some(solid => {

                    if (solid.contains(interactX, interactY) && solid.description) {
                        // Add a line for an abstacle
                        this.parent.ui.textBox.addAdjustedLine("Columbiare", solid.description);
                        return true;
                    }
                });
            }
        }

        this.interact = false;
    }
    
    render(graphicsContext: CanvasRenderingContext2D): void {
        const playerX = this.parent.player.x + this.parent.player.width / 2;
        const playerY = this.parent.player.y + this.parent.player.height / 2;

        graphicsContext.setTransform(1, 0, 0, 1,
            graphicsContext.canvas.width / 2 - playerX,
            graphicsContext.canvas.height / 2 - playerY
        );
        
        this.parent.world.render(graphicsContext, playerX, playerY);

        this.parent.npcs.forEach(npc => {
            npc.render(graphicsContext, playerX, playerY);
        })
        this.parent.player.render(graphicsContext, playerX, playerY);
    }
}