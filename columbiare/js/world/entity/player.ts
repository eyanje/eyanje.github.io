import { Entity } from "./entity";
import { getLines, playSound } from "../../data/resourcemanager";
import { Sprite } from "../../graphics";
import { PlayState } from "../../state/gamestate";

export class Player extends Entity {
    name: string;
    dataPath: string;
    stepTimer: number;

    // Directions work as follows
    // X is major: 0 is none, 3 is left, 6 is right
    // Y is minor: -1 is to top, +1 is to bottom
    // -1 is corrected to 0
    // 7 6 5 4 3 2 1 0
    direction: number; // In terms of radians

    constructor(dataPath: string, x: number, y: number) {
        super("", null, x, y, 64, 64);

        this.dataPath = dataPath;
        this.direction = 1; // forward

        getLines(dataPath, this, lines => lines.forEach(line => {
            
            if (line.includes(' ')) {
                const key: string = line.substring(0, line.indexOf(' '));
                line = line.substring(line.indexOf(' ') + 1);
                switch (key) {
                    case "name": {
                        this.name = name;
                    }
                    break;
                    case "sprite": {
                        this.sprite = new Sprite(line);
                    }
                }
            }
        }));
        this.stepTimer = 0;
    }

    move(parent: PlayState, left: boolean, up: boolean, right: boolean, down: boolean): void {
        let moveX: number = 0;
        let moveY: number = 0;
        
        if (left == right) {
            if (up != down) {
                if (up) {
                    this.direction = 0;
                    moveY = -5;
                } else {
                    moveY = 5;
                    this.direction = 1;
                }
            }
        } else if (left) {
            moveX = -5;
            this.direction = 2;
        } else {
            moveX = 5;
            this.direction = 3;
        }
        
        super.translate(moveX, moveY, parent.solids);

        parent.world.teleports.forEach(teleport => {
            if (
                this.x < teleport.x + teleport.width &&
                this.x + this.width > teleport.x &&
                this.y < teleport.y + teleport.height &&
                this.y + this.height > teleport.y
            ) {
                this.setPosition(teleport.destX, teleport.destY);
            }
        });

        if ((moveX | moveY) == 0) {
            this.sprite.currentAnimation = 'stand' + this.direction;
            this.stepTimer = 0;
        } else {
            this.sprite.currentAnimation = 'walk' + this.direction;

            // Play stepping sound
            --this.stepTimer;
            if (this.stepTimer < 0) {
                playSound("audio/step.ogg");
                this.stepTimer = 16;
            }
        }
    }

    /**
     * Returns -1, 0, or 1, depending on the x-direction the player faces
     */
    getFacingX(): number {
        switch (this.direction) {
            case 2:
            return -1;
            case 3:
            return 1;
            default:
            return 0;
        }
    }

    /**
     * Returns -1, 0, or 1, depending on the y-direction the player faces.
     */
    getFacingY(): number {
        switch (this.direction) {
            case 0:
            return -1;
            case 1:
            return 1;
            default:
            return 0;
        }
    }

    /**
     * Returns the x coordinate of the entity interacted with
     */
    getInteractX(): number {
        return this.x + this.getFacingX() * this.width + this.width / 2;
    }

    getInteractY(): number {
        return this.y + this.getFacingY() * this.height + this.height / 2;
    }
}