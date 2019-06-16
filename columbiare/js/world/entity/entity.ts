import { SolidObject } from "../world";
import { Sprite } from "../../graphics";

/**
 * An entity is anything which can move around.
 * Basically anything alive.
 */
export class Entity extends SolidObject {
    name: string;
    sprite: Sprite;
    x: number;
    y: number;
    width: number;
    height: number;
    data: Array<string>;

    constructor(name: string, spritePath: string, x?: number, y?: number, width?: number, height?: number) {
        super(spritePath, x, y, width, height, null);

        this.name = name;
        this.data = new Array<string>();
    }
    
    collides(solids: Array<SolidObject>): number {
        let collides: number = 0;

        solids.forEach(solid => {
            
            // First check for collision
            if (solid && this !== solid
            && solid.x <= this.x + this.width
            && solid.y <= this.y + this.height
            && solid.x + solid.width >= this.x
            && solid.y + solid.height >= this.y
            ) {
                const collideWidth: number = Math.min(
                    solid.x + solid.width,
                    this.x + this.width
                ) - Math.max(solid.x, this.x);
                const collideHeight = Math.min(
                    solid.y + solid.height,
                    this.y + this.height
                ) - Math.max(solid.y, this.y);

                if ((collideWidth | collideHeight) != 0) {

                    // Move by y axis
                   if (Math.abs(collideWidth) >= Math.abs(collideHeight)) {
                       if (solid.y < this.y) {
                           collides = collides | 0b0001;
                       } else if (solid.y > this.y) {
                           collides = collides | 0b0010;
                       }
                   }
    
                   // Move by x axis
                   if (Math.abs(collideWidth) <= Math.abs(collideHeight)) {
                       if (solid.x < this.x) {
                           collides = collides | 0b0100;
                       } else if (solid.x > this.x) {
                           collides = collides | 0b1000;
                       }
                   }
                }

            }
        });

        return collides;
    }
    
    translate(x: number, y: number, solids?: Array<SolidObject>): void {
        // Records possible movement as 0bxy
        let possible: number = 0b11;
        if (solids) {
            do { // Should eventually reach 0
                possible = 0b11;

                if (x > 0 // Move right
                && ((this.collides(solids) & 0b1000) == 0)) {
                    ++this.x;
                    --x;
                } else if (x < 0 // Move left
                && ((this.collides(solids) & 0b0100) == 0)) {
                    --this.x;
                    ++x;
                } else {
                    possible = possible & 0b01;
                }
                if (y > 0 // Move down
                && ((this.collides(solids) & 0b0010) == 0)) {
                    ++this.y;
                    --y;
                } else if (y < 0 // Moving up
                && ((this.collides(solids) & 0b0001) == 0)) {
                    --this.y;
                    ++y;
                } else {
                    possible = possible & 0b10;
                }
            } while (possible != 0);
        } else {
            this.x += x;
            this.y += y;
        }
    }

    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    render(graphicsContext : CanvasRenderingContext2D, perspectiveX?: number, perspectiveY?: number): void {
        this.sprite.update();
        this.sprite.render(graphicsContext, this.x, this.y, this.width, this.height, perspectiveX, perspectiveY);
    }

    getSprite(): Sprite {
        return this.sprite;
    }

    getDataContainer(): Array<string> {
        return this.data;
    }
}