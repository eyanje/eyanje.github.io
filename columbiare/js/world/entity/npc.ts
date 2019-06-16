import { Entity } from "./entity";
import { getLines } from "../../data/resourcemanager";
import { Sprite } from "../../graphics";
import { DialogueSet } from "./dialogue/dialogue";

export class NPC extends Entity {
    dialogueSet: DialogueSet;
    status: string;
    dataPath: string;
    state: string;
    
    constructor(status: string, dataPath: string,  x?: number, y?: number, data?: Array<string>) {
        super("NPC", null, 0, 0, 16, 16);

        this.status = status;
        this.dataPath = dataPath;

        this.readFile(dataPath);
        
        this.state = null;

        this.x = x;
        this.y = y;

        if (data) {
            this.data = [...data]
        }
    }

    readFile(path: string): void {
        getLines(path, this, lines => lines.forEach(line => {
            
            if (line.includes(' ')) {
                const propertyName: string = line.substring(0, line.indexOf(' '));
                line = line.substring(line.indexOf(' ') + 1);
                switch (propertyName) {
                    case "name": {
                        this.name = line;
                    }
                    break;
                    case "bounds": {
                        const tokens: Array<string> = line.split(' ');
                        this.x = parseInt(tokens[0]);
                        this.y = parseInt(tokens[1]);
                        if (tokens.length >= 3) {
                            this.width = parseInt(tokens[2]);
                        } else {
                            this.width = 64;
                        }
                        if (tokens.length >= 4) {
                            this.height = parseInt(tokens[3]);
                        } else {
                            this.height = 64;
                        }
                    }
                    break;
                    case "sprite": {
                        this.sprite = new Sprite(line);
                    }
                    break;
                    case "dialogue": {
                        this.dialogueSet = new DialogueSet(line, this);
                    }
                    break;
                    case "#":
                    break;
                    default: {
                        console.warn("Invaid npc property " + propertyName + " in " + path);
                    }
                }
            }
        }));
    }

    update(): void {
        if (this.data.length > 0) {
            const first: string = this.data.pop();

            const tokens: Array<string> = first.split(' ');

            const head: string = tokens[0];
            const body: string = first.substring(first.indexOf(' ') + 1);

            if (head && head.length > 0) {
                switch (head) {
                    case "move": {
                        let x: number = parseInt(tokens[1]);
                        let y: number = parseInt(tokens[2]);
                        let speed: number = 4;
                        if (tokens.length >= 4) {
                            speed = parseInt(tokens[3]);
                        }
    
                        let traX = 0;
                        let traY = 0;
    
                        if (x > 0) {
                            traX = speed;
                            x -= speed;
                            if (x < 0) {
                                traX += x;
                                x = 0;
                            }
                        } else if (x < 0) {
                            traX = -speed;
    
                            if (x > 0) {
                                traX += x;
                                x = 0;
                            }
                        }
                        if (y > 0) {
                            traY = speed;
                            y -= speed;
                            if (y < 0) {
                                traY += y;
                                y = 0;
                            }
                        } else if (y < 0) {
                            traY = -speed;
                            y += speed;
                            if (y > 0) {
                                traY += y;
                                y = 0;
                            }
                        }
    
                        this.translate(traX, traY);
    
                        if (x != 0 || y != 0) {
                            this.data.push("move " + x + ' ' + y + ' ' + speed);
                        }
                    }
                    break;
                    case "anim": {
                        this.sprite.currentAnimation = body;
                    }
                    break;
                    default:
                            this.data.push(first);
                    break;
                }
            }
        }

        switch (status) {
            case "stand": {
                // TODO standing
            }
            break;
            case "wander": {
                // TODO wandering
            }
            break;
            case "walk": {
                
            }
        }

        this.sprite.update();
    }

    toString(): string {
        return "npc " + this.status + ' ' + this.state + ' ' + this.dataPath;
    }
}