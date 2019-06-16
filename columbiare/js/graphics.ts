import { getLines } from "./data/resourcemanager";

export class PImage {
    image: HTMLImageElement;
    ready: boolean;

    constructor(path: string, x1?: number, y1?: number, x2?: number, y2?: number) {
        this.image = new Image();
        this.image.src = './res/' + path;
        this.ready = false;
        this.image.addEventListener('load', () => {
            this.ready = true;
        });

        // Subimages to be implemented later
        if (x1 !== undefined) {
            console.info('Subimages are not yet implemented');
        }
    }

    render(graphicsContext: CanvasRenderingContext2D, x: number, y: number, width?: number, height?: number, perspectiveX?: number, perspectiveY?: number) {
        if (this.ready) {
            if (width === undefined || height === undefined ) {
                width = this.image.width;
                height = this.image.height;
            }
            if (perspectiveX === undefined || perspectiveY === undefined ||
                (x + width >= perspectiveX - document.getElementById('canvas').clientWidth / 2 &&
                y + height >= perspectiveY - document.getElementById('canvas').clientHeight / 2 &&
                x <= perspectiveX + document.getElementById('canvas').clientWidth / 2 &&
                y <= perspectiveY + document.getElementById('canvas').clientHeight / 2
                )) {
                graphicsContext.drawImage(this.image, x, y, width, height);
            }
        }
    }
}

export class Pattern extends PImage {
    render(graphicsContext: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, perspectiveX?: number, perspectiveY?: number) {
        if (this.ready) {
            if (width === undefined || height === undefined) {
                super.render(graphicsContext, x, y, undefined, undefined, perspectiveX, perspectiveY);
            } else {
                for (let sx = x; sx + this.image.width / 2 <= x + width; sx += this.image.width) {
                    if (perspectiveX !== undefined) {
                        if (sx + this.image.width < perspectiveX - document.getElementById('canvas').clientWidth / 2) {
                            continue;
                        }
                        if (sx > perspectiveX + document.getElementById('canvas').clientWidth / 2) {
                            break;
                        }
                    }

                    for (let sy = y; sy + this.image.height / 2 <= y + height; sy += this.image.height) {
                        if (perspectiveY !== undefined) {
                            if (sy + this.image.height < perspectiveY - document.getElementById('canvas').clientHeight / 2) {
                                continue;
                            }
                            if (sy > perspectiveY + document.getElementById('canvas').clientHeight / 2) {
                                break;
                            }
                        }
                        graphicsContext.drawImage(this.image, sx, sy);
                    }
                }
            }
        }
    }
}

export class PAnimation {
    frames: Array<PImage>;
    frameLengths: Array<number>;
    frame: number;
    subframe: number;
    
    constructor() {
        this.frames = new Array<PImage>();
        this.frameLengths = new Array<number>();
        this.frame = 0;
        this.subframe = 0;
    }

    addFrame(frameLength: number, frame: PImage) {
        this.frames.push(frame);
        this.frameLengths.push(frameLength);
    }

    update() {
        this.subframe++;
        if (this.subframe >= this.frameLengths[this.frame]) {
            this.frame++;
            this.subframe = 0;
            if (this.frame >= this.frames.length) {
                this.frame = 0;
            }
        }
    }

    render(graphicsContext: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, perspectiveX?: number, perspectiveY?: number) {
        this.frames[this.frame].render(graphicsContext, x, y, width, height, perspectiveX, perspectiveY);
    }
}

export class Sprite {
    animations: Map<string, PAnimation>;
    currentAnimation: string;

    constructor(path: string) {
        this.animations = new Map<string, PAnimation>();
        let current: PAnimation = null;

        this.currentAnimation = null;

        getLines(path, this, lines => lines.forEach(line => {
            // Read each line in the file for data
            line = line.trim();
            const tokens: Array<string> = line.split(' ');
            if (tokens.length >= 1) {
                switch (tokens[0]) {
                    case "a": {
                        // Add a new animation
                        const name: string = line.substring(line.indexOf(' ') + 1);
                        current = new PAnimation();
                        this.addAnimation(name, current);
                    }
                    break;
                    case "i": {
                        // Add a new frame

                        if (tokens.length >= 3) {
                            // Extract basic data
                            const frameLength: number = parseInt(tokens[1]);
                            const imgPath: string = tokens[2];

                            let frame: PImage = null;

                            if (tokens.length <= 3 /* data only*/) {
                                frame = new PImage(imgPath);
                            } else {
                                // Parse first two numbers
                                const t0: number = parseInt(tokens[3]);
                                const t1: number = parseInt(tokens[4]);

                                if (tokens.length <= 3 /* data */ + 2 /* width and height */) {
                                    frame = new PImage(imgPath, t0, t1); // Width and height
                                } else {
                                    // Parse next two numbers (width and height)
                                    const t2: number = parseInt(tokens[5]);
                                    const t3: number = parseInt(tokens[6]);
                                    frame = new PImage(imgPath, t0, t1, t2, t3); // x y width height
                                }
                            }

                            if (!current) {
                                console.error("In " + path + " frame loaded before animation");
                            } else {
                                // Add frame to the last animation created
                                current.addFrame(frameLength, frame);
                            }
                        }
                    }
                    break;
                    case "p": {
                        // Add a new pattern

                        if (tokens.length >= 3) {
                            // Extract basic data
                            const frameLength: number = parseInt(tokens[1]);
                            const imgPath: string = tokens[2];

                            let frame: PImage = null;

                            if (tokens.length <= 3 /* data only*/) {
                                frame = new Pattern(imgPath);
                            } else {
                                // Parse first two numbers
                                const t0: number = parseInt(tokens[2]);
                                const t1: number = parseInt(tokens[3]);

                                if (tokens.length <= 3 /* data */ + 2 /* width and height */) {
                                    frame = new Pattern(imgPath, t0, t1); // Width and height
                                } else {
                                    // Parse next two numbers (width and height)
                                    const t2: number = parseInt(tokens[2]);
                                    const t3: number = parseInt(tokens[3]);
                                    frame = new Pattern(imgPath, t0, t1, t2, t3); // x y width height
                                }
                            }

                            if (!current) {
                                console.error("In " + path + " frame loaded before animation");
                            } else {
                                // Add frame to the last animation created
                                current.addFrame(frameLength, frame);
                            }
                        }
                    }
                    break;
                }
            }
        }));
    }
    
    addAnimation(name: string, animation: PAnimation): void {
        if (name && animation) {
            this.animations.set(name, animation);
            if (!this.currentAnimation) {
                this.currentAnimation = name;
            }
        }
    }

    update() {
        if (this.animations.get(this.currentAnimation)) {
            this.animations.get(this.currentAnimation).update();
        }
    }

    render(graphicsContext: CanvasRenderingContext2D, x: number, y: number, width?: number, height?: number, perspectiveX?: number, perspectiveY?: number) {
        if (this.animations.get(this.currentAnimation)) {
            this.animations.get(this.currentAnimation).render(graphicsContext, x, y, width, height, perspectiveX, perspectiveY);
        }
    }

    setCurrentAnimation(currentAnimation: string) {
        this.currentAnimation = currentAnimation;
    }
}