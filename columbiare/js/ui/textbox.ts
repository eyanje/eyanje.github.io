import { ConversationPart, LinePair, LineSet, DialogueSet, Conversation, DialogueAction } from "../world/entity/dialogue/dialogue";
import { NPC } from "../world/entity/npc";
import { playSound } from "../data/resourcemanager";


export class TextBox {
    static PADDING = 14;
    static CHAR_WIDTH = 14;
    static FONT_SIZE = 18;
    //Deque<String[]> lines;
    parts: Array<ConversationPart>;
    x: number;
    y: number;
    width: number;
    height: number;
    lineRead: number;
    visible: boolean;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.lineRead = 0;

        this.parts = new Array<ConversationPart>();
    }

    hasLines(): boolean {
        return this.parts.length > 0;
    }

    setVisible(visible: boolean): void {
        if (visible !== this.visible) {
            this.lineRead = 0;
            if (visible) {
                playSound("audio/nextline.ogg");
            }
        }
        this.visible = visible;
    }

    addLine(speaker: string, line: string): void {
        this.parts.push(new LinePair(speaker, line));
        //lines.add(new String[] { speaker, line });
        this.setVisible(true);
    }

    /**
     * Reads lines from an NPC and adds them to the dialogue box
     */
    addNPCLines(npc: NPC, trigger: string): void {
        const conv: Conversation = npc.dialogueSet.dialogues.get(trigger).read();
        if (conv != null) {
            conv.parts.forEach(part => {
                
                if (part instanceof LineSet) {
                    const lineSet = part as LineSet;
                    if (lineSet != null) {
                        // Get each fixed line
                        lineSet.getLinesyWidth(this.width - 2 * TextBox.PADDING, '"default" ' + TextBox.FONT_SIZE + 'px').parts.forEach(line => {
                            this.addLine(lineSet.speaker, line);
                        });
                    }
                } else {
                    this.parts.push(part);
                }
            });
        }
        this.setVisible(true);
    }
    /**
     * Reads lines from an NPC and adds them to the dialogue box
     */
    addDialogueSet(set: DialogueSet, trigger: string): void {
        const conv: Conversation = set.dialogues.get(trigger).read();
        if (conv) {
            conv.parts.forEach(part => {
                
            });
            conv.parts.forEach(part => {                
                if (part instanceof LineSet) {
                    const lineSet: LineSet = part as LineSet;
                    if (lineSet) {
                        // Get each fixed line
                        lineSet.getLinesyWidth(this.width - 2 * TextBox.PADDING, '"default" ' + TextBox.FONT_SIZE + 'px').parts.forEach(line => {
                            this.addLine(lineSet.speaker, line);
                        });
                    }
                } else {
                    // Add an action to the deque of conversation actions
                    this.parts.push(part);
                }
            });
        }
        this.setVisible(true);
    }

    addAdjustedLine(speaker: string, line: string): void {
        const lineSet = new LineSet(speaker);
        lineSet.parts.push(line);
        lineSet.getLinesyWidth(this.width - 2 * TextBox.PADDING, '"default" ' + TextBox.FONT_SIZE + 'px').parts.forEach(adjustedLine => {
            this.addLine(lineSet.speaker, adjustedLine);
        });
        this.setVisible(true);
    }

    render(graphicsContext: CanvasRenderingContext2D): void {
        if (this.visible) {
            //String[] linePair = lines.peek();
            const part: ConversationPart = this.parts[0];

            if (part && part instanceof LinePair) {
                const pair: LinePair = part as LinePair;
            
                const speaker: string = pair.speaker;
                let  line: string = pair.line;

                if (speaker && line) {

                    // Draw the main rectangle
                    graphicsContext.fillStyle = 'rgba(0, 255, 0, 0.75)';
                    graphicsContext.fillRect(this.x, this.y, this.width, this.height);

                    // Draw the name rectangle
                    graphicsContext.fillStyle = 'rgba(0, 127, 0, 0.75)';
                    graphicsContext.fillRect(this.x, this.y - TextBox.PADDING * 2 - TextBox.FONT_SIZE, this.width / 2, TextBox.PADDING * 2 + TextBox.FONT_SIZE);
                    
                    if (this.lineRead < line.length) {
                        line = line.substring(0, this.lineRead);
                    }
                    graphicsContext.fillStyle = 'rgba(0, 0, 0, 1)';
                    // Draw the speaker name
                    graphicsContext.fillText(speaker, this.x + TextBox.PADDING, this.y - TextBox.PADDING, this.width / 2);
                    // Draw the text
                    // Cut out the first few lines, if they are too high
                    for (
                        let textHeight = line.split("\n").length * (TextBox.FONT_SIZE * 3 / 2);
                        textHeight + 2*TextBox.PADDING > this.height;
                        textHeight = line.split("\n").length * TextBox.FONT_SIZE * 3 / 2
                    ) {
                        //System.out.println("Shortening line " + line);
                        line = line.substring(line.indexOf('\n') + 1);
                    }
                    graphicsContext.fillText(line, this.x + TextBox.PADDING, this.y + TextBox.PADDING + TextBox.FONT_SIZE);
                } else {
                    this.setVisible(false);
                }
            }
        }
    }

    advanceChar(): void {
        if (this.parts.length > 0) {

            const current = this.parts[0];
            
            if (current instanceof LinePair) {
                const pair: LinePair = current as LinePair;
                
                if (this.lineRead < pair.line.length) {
                    ++this.lineRead;
                }
            }
        }

    }

    advanceLine(): void {
        if (this.parts.length == 0) {
            this.setVisible(false);
        } else {
            let part: ConversationPart = this.parts[0];

            // All current lines should be line pairs.
            if (part instanceof LinePair) {
                const pair: LinePair = part as LinePair;
                
                if (this.lineRead < pair.line.length) {
                    // Skip to the end of the line
                    this.lineRead = pair.line.length;
                } else {
                    // Go to the next line
                    this.parts.shift();
                    part = this.parts[0];

                    // Find the next linepair
                    while (part && !(part instanceof LinePair)) {
                        if (part instanceof DialogueAction) {
                            // Consume a dialogue action if encountered
                            (part as DialogueAction).consume();
                        }
                        this.parts.shift();
                        part = this.parts[0];
                    }

                    // No LinePair parts exist
                    if (part && part instanceof LinePair) {
                        // Move to the next line
                        this.lineRead = 0;
                        playSound("audio/nextline.ogg");
                    } else {
                        this.setVisible(false);
                    }
                }
            } else {
                this.setVisible(false);
            }
        }

    }

}