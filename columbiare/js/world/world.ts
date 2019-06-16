import { Sprite } from "../graphics";
import { getLines } from "../data/resourcemanager";

export class BackgroundObject {
    sprite: Sprite;
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(spritePath: string, x: number, y: number, width: number, height: number) {
        this.sprite = new Sprite(spritePath);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    update(): void {
        this.sprite.update();
    }

    render(graphicsContext: CanvasRenderingContext2D, perspectiveX?: number, perspectiveY?: number): void {
        this.sprite.render(graphicsContext, this.x, this.y, this.width, this.height, perspectiveX, perspectiveY);
    }
}

export class SolidObject {
    sprite: Sprite;
    x: number;
    y: number;
    width: number;
    height: number;
    description: string;

    constructor(spritePath: string, x: number, y: number, width: number, height: number, description: string) {
        this.sprite = new Sprite(spritePath);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.description = description;
    }

    update(): void {
        this.sprite.update();
    }

    render(graphicsContext: CanvasRenderingContext2D, perspectiveX?: number, perspectiveY?: number): void {
        //gc.setFill(new Color(0, 1, 0, 0.2));
        //gc.fillRect(x, y, width, height);
        this.sprite.render(graphicsContext, this.x, this.y, this.width, this.height, perspectiveX, perspectiveY);
    }

    contains(x: number, y: number): boolean {
        return x >= this.x && x <= this.x + this.width &&
        y >= this.y && y <= this.y + this.height;
    }
}

export class Teleport {
    x: number;
    y: number;
    width: number;
    height: number;
    destX: number;
    destY: number;

    constructor(x: number, y: number, width: number, height: number, destX: number, destY: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.destX = destX;
        this.destY = destY;
    }
}

export class World {
    solids: Array<SolidObject>;
    nonsolids: Array<BackgroundObject>;
    teleports: Array<Teleport>;
    path: string;

    constructor(path?: string) {
        if (path === undefined) {
            path = './world/world.wld';
        }

        this.path = path;
        this.solids = new Array<SolidObject>();
        this.nonsolids = new Array<BackgroundObject>();
        this.teleports = new Array<Teleport>();

        getLines(path, this, lines => lines.forEach(line => {
            
            if (line.length > 0 && line.includes(' ')) {
                const type = line.substring(0, line.indexOf(' '));
                if (type !== '#') {
                    line = line.substring(line.indexOf(' ') + 1);

                    const x = line.substring(0, line.indexOf(' '));
                    line = line.substring(line.indexOf(' ') + 1);
                    const y = line.substring(0, line.indexOf(' '));
                    line = line.substring(line.indexOf(' ') + 1);
                    const width = line.substring(0, line.indexOf(' '));
                    line = line.substring(line.indexOf(' ') + 1);
                    const height = line.substring(0, line.indexOf(' '));
                    line = line.substring(line.indexOf(' ') + 1);

                    switch (type) {
                        case 'solid': {
                            if (line.includes(' ')) {
                                const dataPath = line.substring(0, line.indexOf(' '));
                                line = line.substring(line.indexOf(' ') + 1);

                                this.solids.push(new SolidObject(dataPath,
                                parseInt(x), parseInt(y),
                                parseInt(width), parseInt(height),
                                line));
                            } else {
                                this.solids.push(new SolidObject(line,
                                parseInt(x), parseInt(y),
                                parseInt(width), parseInt(height),
                                null));
                            }
                        }
                        break;
                        case 'nonsolid': {
                            this.nonsolids.push(new BackgroundObject(line,
                            parseInt(x), parseInt(y),
                            parseInt(width), parseInt(height)));
                        }
                        break;
                        case "teleport": {
                            const destX = line.substring(0, line.indexOf(' '));
                            line = line.substring(line.indexOf(' ') + 1);
                            this.teleports.push(new Teleport(parseInt(x), parseInt(y),
                            parseInt(width), parseInt(height),
                            parseInt(destX), parseInt(line)));
                        }
                        break;
                    }
                }
            }
        }));
    }

    update(): void {
        this.nonsolids.forEach(nonsolid => {
            nonsolid.update();
        });
        this.solids.forEach(obstacle => {
            obstacle.update();
        })
    }

    render(graphicsContext: CanvasRenderingContext2D, perspectiveX?: number, perspectiveY?: number): void {
        
        this.nonsolids.forEach(nonsolid => {
            nonsolid.render(graphicsContext, perspectiveX, perspectiveY);
        });
        this.solids.forEach(solid => {
            solid.render(graphicsContext, perspectiveX, perspectiveY);
        });
    }
}