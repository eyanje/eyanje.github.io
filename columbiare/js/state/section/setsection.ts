import { GameState, PlayState } from "../gamestate";
import { Section } from "./section";
import { PlaySection } from "./playsection";
import { NPC } from "../../world/entity/npc";
import { getLines } from "../../data/resourcemanager";
import { getSection } from "./premades";

export class SetSection extends Section {
    parent: PlayState;
    actions: Array<string>;
    cameraX: number;
    cameraY: number;

    constructor(parent: PlayState, path: string) {
        super(parent);

        this.actions = new Array<string>();;

        getLines(path, this, lines => this.actions = [...lines].reverse());
        this.cameraX = parent.player.x + parent.player.width / 2;
        this.cameraY = parent.player.y + parent.player.height / 2;

        this.nextSection = this;

    }

    keyDown(event: KeyboardEvent) {
        if (event.keyCode == 90) {
            this.interact = true;
        }
    }

    update(): void {

        if (this.actions.length > 0) {
            const action: string = this.actions.pop();
            
            let type: string;
            let data: string;

            if (action.includes(' ')) {
                type = action.substring(0, action.indexOf(' '));
                data = action.substring(action.indexOf(' ') + 1).trim();
            } else {
                type = action;
                data = "";
            }

            switch (type) {
                case "section": {
                    this.nextSection = getSection(data, this.parent);
                    if (!this.nextSection) {
                        this.nextSection = this;
                    }
                }
                break;
                case "wait": {
                    const len: number = parseInt(data);
                    if (len > 0) {
                        this.actions.push("wait " + (parseInt(data) - 1));
                    }
                }
                break;
                case "pan": {
                    const tokens: Array<string> = data.split(' ');
                    let panX = parseInt(tokens[0]);
                    let panY = parseInt(tokens[1]);
                    let speed = 1;
                    // Load a new speed
                    if (tokens.length >= 3) {
                        speed = parseInt(tokens[2]);
                    }

                    if (panX < 0) {
                        this.cameraX -= speed;
                        panX += speed;
                        // Check for overshooting
                        if (panX > 0) {
                            this.cameraX += panX;
                            panX = 0;
                        }
                    } else if (panX > 0) {
                        this.cameraX += speed;
                        panX -= speed;
                        // Check for overshooting
                        if (panX < 0) {
                            this.cameraX += panX;
                            panX = 0;
                        }
                    }
                    if (panY < 0) {
                        this.cameraY -= speed;
                        panY += speed;
                        // Check for overshooting
                        if (panY > 0) {
                            this.cameraY += panY;
                            panY = 0;
                        }
                    } else if (panY > 0) {
                        this.cameraY += speed;
                        panY -= speed;
                        // Check for overshooting
                        if (panY < 0) {
                            this.cameraY += panY;
                            panY = 0;
                        }
                    }
                    if ((panX | panY) != 0) {
                        this.actions.push("pan " + panX + ' ' + panY + ' ' + speed);
                    }
                }
                break;
                case "panto": {
                    const tokens: Array<string> = data.split(' ');
                    const panX: number = parseInt(tokens[0]);
                    const panY: number = parseInt(tokens[1]);
                    let speed: number = 1;
                    // Load a new speed
                    if (tokens.length >= 3) {
                        speed = parseInt(tokens[2]);
                    }
                    this.actions.push("pan " + (panX - this.cameraX) + ' ' + (panY - this.cameraY) + ' ' + speed);
                }
                break;
                case "tp": {
                    const tokens: Array<string> = data.split(' ');
                    const tpX: number = parseInt(tokens[0]);
                    const tpY: number = parseInt(tokens[1]);
                    this.cameraX = tpX;
                    this.cameraY = tpY;
                }
                break;
                case "npc": {
                    const name: string = data.substring(0, data.indexOf(' '));
                    data = data.substring(data.indexOf(' ') + 1);

                    const npc: NPC = this.parent.getNPCByName(name);

                    const subAction: string = data.substring(0, data.indexOf(' '));
                    data = data.substring(data.indexOf(' ') + 1);

                    switch (subAction) {
                        case "move": {
                            const tokens: Array<string> = data.split(' ');
                            let moveX: number = parseInt(tokens[0]);
                            let moveY: number = parseInt(tokens[1]);
                            let speed: number = 1;
                            if (tokens.length >= 3) {
                                speed = parseInt(tokens[2]);
                            }

                            // Load a new speed
                            if (tokens.length >= 3) {
                                speed = parseInt(tokens[2]);
                            }

                            if (moveX < 0) {
                                npc.translate(-speed, 0, this.parent.world.solids);
                                moveX += speed;
                                // Check for overshooting
                                if (moveX > 0) {
                                    npc.translate(moveX, 0, this.parent.world.solids);
                                    moveX = 0;
                                }
                            } else if (moveX > 0) {
                                npc.translate(speed, 0, this.parent.world.solids);
                                moveX -= speed;
                                // Check for overshooting
                                if (moveX < 0) {
                                    npc.translate(moveX, 0, this.parent.world.solids);
                                    moveX = 0;
                                }
                            }
                            if (moveY < 0) {
                                npc.translate(0, -speed, this.parent.world.solids);
                                moveY += speed;
                                // Check for overshooting
                                if (moveY > 0) {
                                    npc.translate(moveY, 0, this.parent.world.solids);
                                    moveY = 0;
                                }
                            } else if (moveY > 0) {
                                npc.translate(0, speed, this.parent.world.solids);
                                moveY -= speed;
                                // Check for overshooting
                                if (moveY < 0) {
                                    npc.translate(moveY, 0, this.parent.world.solids);
                                    moveY = 0;
                                }
                            }
                            if ((moveX | moveY) != 0) {
                                this.actions.push("npc move " + moveX + ' ' + moveY + ' ' + speed);
                            }
                        }
                    }
                }
                break;
                case "text": {
                    if (data.length == 0) {
                        // Keep going through old text
                        if (this.interact) {
                            this.parent.ui.interact();
                        }
                        if (this.parent.ui.isOpen()) {
                            this.actions.push("text");
                        }
                    } else {
                        // Add new text
                        const name: string = data.substring(0, data.indexOf(' '));
                        const text: string = data.substring(data.indexOf(' ') + 1);
                        this.parent.ui.textBox.addAdjustedLine(name, text);
                        this.actions.push("text");
                    }
                }
                break;
                case "#":
                break;
                default: {
                    console.info("Unrecognized action " + action);
                }
                break;
            }
        }
        
        this.interact = false;
        super.update();
    }

    render(graphicsContext: CanvasRenderingContext2D): void {
        graphicsContext.setTransform(1, 0, 0, 1, graphicsContext.canvas.width / 2 - this.cameraX, graphicsContext.canvas.height / 2 - this.cameraY);

        this.parent.world.render(graphicsContext, this.cameraX, this.cameraY);

        this.parent.npcs.forEach(npc => {
            npc.render(graphicsContext, this.cameraX, this.cameraY);
        })
        this.parent.player.render(graphicsContext, this.cameraX, this.cameraY);

    }

}