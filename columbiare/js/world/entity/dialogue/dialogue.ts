import { NPC } from "../npc";
import { getLines } from "../../../data/resourcemanager";

export interface ConversationPart {}

export class LinePair implements ConversationPart {
    speaker : string;
    line : string;

    constructor(speaker: string, line: string) {
        this.speaker = speaker;
        this.line = line;
    }
}

export class DialogueAction implements ConversationPart {
    data: string;
    container: Array<String>;

    constructor(container: Array<String>, data: string) {
        this.container = container;
        this.data = data;
    }
    
    consume(): void {
        this.container.unshift(this.data);
    }

}

export class LineSet implements ConversationPart {
    speaker: string;
    parts: Array<string>;

    constructor(speaker: string) {
        this.speaker = speaker;
        this.parts = new Array<string>();
    }

    /**
     * Fixes the spacing on lines
     * Only break on another space
     */
    fixLinesByLength(lines: LineSet, maxLength: number): LineSet {
        let fixed: LineSet = new LineSet(lines.speaker);
        if (lines.parts.length > 0) {
            lines.parts.forEach(line => {
                let fixedLine: string = '';
                while (line.length > maxLength) {
                    const loc: number = line.lastIndexOf(' ',  maxLength);
                    if (fixedLine.length > 0) {
                        fixedLine += '\n';
                    }
                    fixedLine += line.substring(0, loc);
                    line = line.substring(loc + 1);
                }
                if (line.length > 0) {
                    if (fixedLine.length > 0) {
                    fixedLine += '\n';
                    }
                    fixedLine += line;
                }
                fixed.parts.push(fixedLine);
            });
        }
        return fixed;
    }

    static lineWidth(text: string, font: string): number {
        if (text.length == 0) {
            return 0;
        }

        let textNode = document.createElement('span');
        
        textNode.style.font = font;
        return textNode.clientWidth;
    }

    /**
     * Fixes the spacing on lines
     * Only break on another space
     */
    static fixLinesByWidth(lines: LineSet, maxWidth: number, font: string): LineSet {
        const fixed: LineSet = new LineSet(lines.speaker);
        if (lines.parts.length > 0) {
            lines.parts.forEach(line => {

                let fixedLine: string = "";
                while (LineSet.lineWidth(line, font) > maxWidth) {
                    // Count the width
                    let maxI: number = 0;
                    let width: number = LineSet.lineWidth(line.charAt(0), font);
                    for (let i = 1; i < line.length; ++i) {
                        // Accumulation is O(1) instead of O(n)
                        width += LineSet.lineWidth(line.charAt(i), font);
                        if (width > maxWidth) {
                            maxI = i - 1;
                            break;
                        }
                    }
                    // Find the last space before or at the max
                    let loc: number = line.lastIndexOf(' ',  maxI - 1);
                    if (loc == -1) {
                        loc = maxI;
                    }
                    // Add a newline to the end of the last line
                    if (fixedLine.length > 0) {
                        fixedLine += '\n';
                    }
                    // Add the cut text
                    fixedLine += line.substring(0, loc);
                    line = line.substring(loc + 1);
                }
                if (line.length > 0) {
                    if (fixedLine.length > 0) {
                    fixedLine += '\n';
                    }
                    fixedLine += line;
                }
                fixed.parts.push(fixedLine);
            });
        }
        return fixed;
    }

    addToLine(text: string): void {
        if (this.parts.length == 0) {
            console.warn("No lines exist!");
            console.info("Adding " + text + " as a separate line...");
            this.parts.push(text);
        } else {
            this.parts[this.parts.length - 1] += text;
        }
    }

    getLinesByLength(maxLength: number): LineSet {
        return this.fixLinesByLength(this, maxLength);
    }

    getLinesyWidth(maxWidth: number, font: string): LineSet {
        return LineSet.fixLinesByWidth(this, maxWidth, font);
    }
}

export class Conversation {
    parts: Array<ConversationPart>;
    read: boolean;

    constructor() {
        this.parts = new Array<ConversationPart>();
    }
}

export class ConversationSet {
    conversations: Array<Conversation>;

    constructor() {
        this.conversations = new Array<Conversation>();
    }

    read(): Conversation {
        let conv = this.conversations[this.conversations.length - 1];
        if (this.conversations.length > 1) {
            conv = this.conversations.shift();
        }
        if (conv != null) {
            conv.read = true;
        }
        return conv;
    }
}

export class DialogueSet {
    dialogues: Map<string, ConversationSet>;
    
    constructor(path, parent: NPC) {
        this.dialogues = new Map<string, ConversationSet>();

        let currentTrigger: string = null;
        let speaker: string = parent.name;

        getLines(path, this, lines => lines.forEach(line => {
            line = line.trim();
            if (line.length  > 0) {
                let key: string = line;
                if (line.includes(' ')) {
                    key = line.substring(0, line.indexOf(' '));
                    line = line.substring(line.indexOf(' ') + 1);
                }
                switch (key) {
                    // Load a new trigger
                    case "t": {
                        currentTrigger = line;
                        if (!this.dialogues.has(currentTrigger)) {
                            this.dialogues.set(currentTrigger, new ConversationSet());
                        }
                    }
                    break;
                    case "c": {
                        // Add a new conversation to the current deque
                        this.dialogues.get(currentTrigger).conversations.push(new Conversation());
                    }
                    case "s": {
                        speaker = line;
                        if (currentTrigger && this.dialogues.has(currentTrigger)) {
                            if (!this.dialogues.get(currentTrigger).conversations || this.dialogues.get(currentTrigger).conversations.length == 0) {
                                console.warn("No conversation at " + line);
                                console.warn("Adding default conversation");
                                this.dialogues.get(currentTrigger).conversations.push(new Conversation());
                            }
                            // Add a new LineSet
                            this.dialogues.get(currentTrigger).conversations[this.dialogues.get(currentTrigger).conversations.length - 1].parts.push(new LineSet(speaker));
                        } else {
                            console.error("Invalid current trigger on line " + line);
                        }
                    }
                    break;
                    case "l": {
                        // Add a line to the current lineSet
                        if (!currentTrigger || !this.dialogues.has(currentTrigger)) {
                            console.error("Invalid current trigger on line " + line);
                        } else if (!speaker) {
                            console.error("Current speaker is null on line " + line);
                        } else {
                            this.addLine(currentTrigger, line);
                        }
                    }
                    break;
                    case "d": {
                        // Add some data to run
                        this.dialogues.get(currentTrigger).conversations[this.dialogues.get(currentTrigger).conversations.length - 1].parts.push(new DialogueAction(parent.data, line));
                    }
                    break;
                    case "#":
                    break;
                    default: {
                        // Add the line to the last line
                        line = key + ' ' + line;
                        this.addToLine(currentTrigger, ' ' + line);
                    }
                    // TODO add dialogue options
                }
            }

        }));
    }

    addLine(trigger: string, line: string): void {
        if (!trigger) {
            console.error("Trigger is null when adding line " + line);
        } else if (!this.dialogues.has(trigger) || !this.dialogues.get(trigger)) {
            console.error("Trigger " + trigger + " is not a valid trigger when adding line " + line);
        } else if (!line) {
            console.error("Line is null");
        } else {
            // Get last conversation
            let conv: Conversation = this.dialogues.get(trigger).conversations[this.dialogues.get(trigger).conversations.length - 1];
            // Add the line to the end of the list
            let part: ConversationPart = conv.parts[conv.parts.length - 1];

            if (part instanceof LineSet) {
                part.parts.push(line);
            } else {
                console.warn("Adding line " + line + " in trigger " + trigger + " to a non-lineset");
            }
        }
    }

    addToLine(trigger: string, text: string): void {
        if (!trigger) {
            console.error("Trigger is null when adding text " + text);
        } else if (!this.dialogues.has(trigger) || !this.dialogues.get(trigger)) {
            console.error("Trigger " + trigger + " is not a valid trigger when adding text " + text);
        } else if (text == null) {
            console.error("Text is null");
        } else {
            let last: ConversationPart = this.peekLastConversation(trigger).parts[this.peekLastConversation(trigger).parts.length - 1];
            if (last instanceof LineSet) {
                last.addToLine(text);
            } else {
                console.warn("Adding line " + text + " in trigger " + trigger + " to a non-lineset");
            }
        }
    }

    /**
     * Reads the next conversation
     * @return the last unread conversation
     */
    readConversation(trigger: string): Conversation {
        return this.dialogues.get(trigger).read();
    }

    /**
     * Peeks the last conversation
     * @return the last unread conversation
     */
    peekLastConversation(trigger: string): Conversation {
        return this.dialogues.get(trigger).conversations[this.dialogues.get(trigger).conversations.length - 1];
    }
}
