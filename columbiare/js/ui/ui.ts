import { TextBox } from "./textbox";

export class UI {
    textBox: TextBox;

    constructor() {
        const canvas = document.getElementById('canvas');

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        this.textBox = new TextBox(0, height * 3 / 4, width, height / 4);
    }

    update(): void {
        this.textBox.advanceChar();
    }

    interact(): void {
        if (this.textBox.hasLines()) {
            this.textBox.advanceLine();
        } else {
            this.textBox.setVisible(false);
        }
    }

    isOpen(): boolean {
        return this.textBox.visible;
    }

    render(graphicsContext: CanvasRenderingContext2D): void {
        graphicsContext.setTransform(1, 0, 0, 1, 0, 0);

        this.textBox.render(graphicsContext);
    }
}