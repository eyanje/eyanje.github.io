import { GameState, PlayState } from "../gamestate";
import { SetSection } from "./setsection";
import { playMusic, stopMusic } from "../../data/resourcemanager";
import { PlaySection } from "./playsection";
import { Section } from "./section";

export class A1S1_0 extends SetSection {
    
    constructor(parent: PlayState) {
        super(parent, "sections/a1s1-0.set");

        playMusic("audio/act1.ogg");

        parent.recomputeSolids();
    }
}

export class A1S1_1 extends PlaySection {
    transition: boolean;

    constructor(parent: PlayState) {
        super(parent);
        
        parent.recomputeSolids();

        this.transition = false;
        playMusic("audio/act1.ogg");

    }

    update(): void {
        super.update();
        if (this.parent.player.x > 4096 && this.parent.player.y <= 468) {
            this.transition = true;
            this.parent.progress = "a1s2";
        }
    }

    getNextSection(): Section {
        if (this.transition) {
            return new A1S2(this.parent);
        }
        return this;
    }
}

export class A1S2 extends PlaySection {
    transition: boolean;

    constructor(parent: PlayState) {
        super(parent);
        
        this.parent.getNPCByName("Amia").setPosition(5024, 3264);

        this.parent.recomputeSolids();
        playMusic("audio/act1.ogg");

        if (this.parent.player.y > 1024) {
            // Play act 2 later
        }
        this.transition = false;
    }

    update(): void {
        super.update();

        const data: Array<string> = this.parent.getNPCByName("Fara").data;
        //System.out.println(data);
        if (data.length > 0 && data[0] === 'received') {
            this.transition = true;
        }
    }

    getNextSection(): Section {
        if (this.transition) {
            return new A2_0(this.parent);
        }
        return this;
    }

}

export class A2_0 extends PlaySection {
    transition: boolean;

    constructor(parent: PlayState) {
        super(parent);
        // TODO Auto-generated constructor stub

        this.parent.getNPCByName("Amia").setPosition(6114, 464);
        this.parent.getNPCByName("Amia").getSprite().setCurrentAnimation("dead");
        this.parent.getNPCByName("Amia").data.length = 0;
        
        playMusic("audio/act1.ogg");
        
        this.parent.setProgress("a2s1");
        this.transition = false;
    }

    update(): void {
        super.update();
        
        const data: Array<string> = this.parent.getNPCByName("Amia").getDataContainer();
        //System.out.println(data);
        if (data.length > 0 && data[0] === 'dead') {
            this.transition = true;
        }
    }

    getNextSection(): Section {
        if (this.transition) {
            return new A3(this.parent);
        }
        return this;
    }
}

export class A3 extends PlaySection {
    transition: boolean;

    constructor(parent: PlayState) {
        super(parent);

        stopMusic();
        
        this.parent.setProgress("a3s1");

        this.parent.getNPCByName("Fara").data.length = 0;
    }

    update() {
        super.update();

        const data: Array<string> = this.parent.getNPCByName("Fara").getDataContainer();
        //System.out.println(data);
        if (data.length > 0 && data[0] === 'reveal') {
            this.transition = true;
        }
    }


    getNextSection(): Section {
        if (this.transition) {
            return new End(this.parent);
        }
        return this;
    }
}

export class End extends Section {
    constructor(parent: PlayState) {
        super(parent);
        playMusic("audio/meme.ogg");
    }

    render(graphicsContext: CanvasRenderingContext2D): void {
        
        graphicsContext.setTransform(1, 0, 0, 1, 0, 0);

        graphicsContext.fillStyle = 'white';
        
        graphicsContext.font = '48px "Gabriola"';
        graphicsContext.fillText("You're an idiot.", graphicsContext.canvas.width / 2, graphicsContext.canvas.height / 2);
    }
}

export function getSection(sectionName: string, parent: PlayState): Section {
    switch (sectionName) {
        case 'com.glowingpigeon.columbiare.state.premade.A1S1_0':
            return new A1S1_0(parent);
        case 'com.glowingpigeon.columbiare.state.premade.A1S1_1':
            return new A1S1_1(parent);
        case 'com.glowingpigeon.columbiare.state.premade.A1S2':
            return new A1S2(parent);
        case 'com.glowingpigeon.columbiare.state.premade.A2':
            return new A2_0(parent);
        case 'com.glowingpigeon.columbiare.state.premade.A3':
            return new A3(parent);
        case 'com.glowingpigeon.columbiare.state.premade.End':
            return new End(parent);
        default:
            return new A1S1_0(parent);
    }
}
