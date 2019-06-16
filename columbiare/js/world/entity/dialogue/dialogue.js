define(["require", "exports", "../../../data/resourcemanager"], function (require, exports, resourcemanager_1) {
    "use strict";
    exports.__esModule = true;
    var LinePair = /** @class */ (function () {
        function LinePair(speaker, line) {
            this.speaker = speaker;
            this.line = line;
        }
        return LinePair;
    }());
    exports.LinePair = LinePair;
    var DialogueAction = /** @class */ (function () {
        function DialogueAction(container, data) {
            this.container = container;
            this.data = data;
        }
        DialogueAction.prototype.consume = function () {
            this.container.unshift(this.data);
        };
        return DialogueAction;
    }());
    exports.DialogueAction = DialogueAction;
    var LineSet = /** @class */ (function () {
        function LineSet(speaker) {
            this.speaker = speaker;
            this.parts = new Array();
        }
        /**
         * Fixes the spacing on lines
         * Only break on another space
         */
        LineSet.prototype.fixLinesByLength = function (lines, maxLength) {
            var fixed = new LineSet(lines.speaker);
            if (lines.parts.length > 0) {
                lines.parts.forEach(function (line) {
                    var fixedLine = '';
                    while (line.length > maxLength) {
                        var loc = line.lastIndexOf(' ', maxLength);
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
        };
        LineSet.lineWidth = function (text, font) {
            if (text.length == 0) {
                return 0;
            }
            var textNode = document.createElement('span');
            textNode.style.font = font;
            return textNode.clientWidth;
        };
        /**
         * Fixes the spacing on lines
         * Only break on another space
         */
        LineSet.fixLinesByWidth = function (lines, maxWidth, font) {
            var fixed = new LineSet(lines.speaker);
            if (lines.parts.length > 0) {
                lines.parts.forEach(function (line) {
                    var fixedLine = "";
                    while (LineSet.lineWidth(line, font) > maxWidth) {
                        // Count the width
                        var maxI = 0;
                        var width = LineSet.lineWidth(line.charAt(0), font);
                        for (var i = 1; i < line.length; ++i) {
                            // Accumulation is O(1) instead of O(n)
                            width += LineSet.lineWidth(line.charAt(i), font);
                            if (width > maxWidth) {
                                maxI = i - 1;
                                break;
                            }
                        }
                        // Find the last space before or at the max
                        var loc = line.lastIndexOf(' ', maxI - 1);
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
        };
        LineSet.prototype.addToLine = function (text) {
            if (this.parts.length == 0) {
                console.warn("No lines exist!");
                console.info("Adding " + text + " as a separate line...");
                this.parts.push(text);
            }
            else {
                this.parts[this.parts.length - 1] += text;
            }
        };
        LineSet.prototype.getLinesByLength = function (maxLength) {
            return this.fixLinesByLength(this, maxLength);
        };
        LineSet.prototype.getLinesyWidth = function (maxWidth, font) {
            return LineSet.fixLinesByWidth(this, maxWidth, font);
        };
        return LineSet;
    }());
    exports.LineSet = LineSet;
    var Conversation = /** @class */ (function () {
        function Conversation() {
            this.parts = new Array();
        }
        return Conversation;
    }());
    exports.Conversation = Conversation;
    var ConversationSet = /** @class */ (function () {
        function ConversationSet() {
            this.conversations = new Array();
        }
        ConversationSet.prototype.read = function () {
            var conv = this.conversations[this.conversations.length - 1];
            if (this.conversations.length > 1) {
                conv = this.conversations.shift();
            }
            if (conv != null) {
                conv.read = true;
            }
            return conv;
        };
        return ConversationSet;
    }());
    exports.ConversationSet = ConversationSet;
    var DialogueSet = /** @class */ (function () {
        function DialogueSet(path, parent) {
            var _this = this;
            this.dialogues = new Map();
            var currentTrigger = null;
            var speaker = parent.name;
            resourcemanager_1.getLines(path, this, function (lines) { return lines.forEach(function (line) {
                line = line.trim();
                if (line.length > 0) {
                    var key = line;
                    if (line.includes(' ')) {
                        key = line.substring(0, line.indexOf(' '));
                        line = line.substring(line.indexOf(' ') + 1);
                    }
                    switch (key) {
                        // Load a new trigger
                        case "t":
                            {
                                currentTrigger = line;
                                if (!_this.dialogues.has(currentTrigger)) {
                                    _this.dialogues.set(currentTrigger, new ConversationSet());
                                }
                            }
                            break;
                        case "c": {
                            // Add a new conversation to the current deque
                            _this.dialogues.get(currentTrigger).conversations.push(new Conversation());
                        }
                        case "s":
                            {
                                speaker = line;
                                if (currentTrigger && _this.dialogues.has(currentTrigger)) {
                                    if (!_this.dialogues.get(currentTrigger).conversations || _this.dialogues.get(currentTrigger).conversations.length == 0) {
                                        console.warn("No conversation at " + line);
                                        console.warn("Adding default conversation");
                                        _this.dialogues.get(currentTrigger).conversations.push(new Conversation());
                                    }
                                    // Add a new LineSet
                                    _this.dialogues.get(currentTrigger).conversations[_this.dialogues.get(currentTrigger).conversations.length - 1].parts.push(new LineSet(speaker));
                                }
                                else {
                                    console.error("Invalid current trigger on line " + line);
                                }
                            }
                            break;
                        case "l":
                            {
                                // Add a line to the current lineSet
                                if (!currentTrigger || !_this.dialogues.has(currentTrigger)) {
                                    console.error("Invalid current trigger on line " + line);
                                }
                                else if (!speaker) {
                                    console.error("Current speaker is null on line " + line);
                                }
                                else {
                                    _this.addLine(currentTrigger, line);
                                }
                            }
                            break;
                        case "d":
                            {
                                // Add some data to run
                                _this.dialogues.get(currentTrigger).conversations[_this.dialogues.get(currentTrigger).conversations.length - 1].parts.push(new DialogueAction(parent.data, line));
                            }
                            break;
                        case "#":
                            break;
                        default: {
                            // Add the line to the last line
                            line = key + ' ' + line;
                            _this.addToLine(currentTrigger, ' ' + line);
                        }
                        // TODO add dialogue options
                    }
                }
            }); });
        }
        DialogueSet.prototype.addLine = function (trigger, line) {
            if (!trigger) {
                console.error("Trigger is null when adding line " + line);
            }
            else if (!this.dialogues.has(trigger) || !this.dialogues.get(trigger)) {
                console.error("Trigger " + trigger + " is not a valid trigger when adding line " + line);
            }
            else if (!line) {
                console.error("Line is null");
            }
            else {
                // Get last conversation
                var conv = this.dialogues.get(trigger).conversations[this.dialogues.get(trigger).conversations.length - 1];
                // Add the line to the end of the list
                var part = conv.parts[conv.parts.length - 1];
                if (part instanceof LineSet) {
                    part.parts.push(line);
                }
                else {
                    console.warn("Adding line " + line + " in trigger " + trigger + " to a non-lineset");
                }
            }
        };
        DialogueSet.prototype.addToLine = function (trigger, text) {
            if (!trigger) {
                console.error("Trigger is null when adding text " + text);
            }
            else if (!this.dialogues.has(trigger) || !this.dialogues.get(trigger)) {
                console.error("Trigger " + trigger + " is not a valid trigger when adding text " + text);
            }
            else if (text == null) {
                console.error("Text is null");
            }
            else {
                var last = this.peekLastConversation(trigger).parts[this.peekLastConversation(trigger).parts.length - 1];
                if (last instanceof LineSet) {
                    last.addToLine(text);
                }
                else {
                    console.warn("Adding line " + text + " in trigger " + trigger + " to a non-lineset");
                }
            }
        };
        /**
         * Reads the next conversation
         * @return the last unread conversation
         */
        DialogueSet.prototype.readConversation = function (trigger) {
            return this.dialogues.get(trigger).read();
        };
        /**
         * Peeks the last conversation
         * @return the last unread conversation
         */
        DialogueSet.prototype.peekLastConversation = function (trigger) {
            return this.dialogues.get(trigger).conversations[this.dialogues.get(trigger).conversations.length - 1];
        };
        return DialogueSet;
    }());
    exports.DialogueSet = DialogueSet;
});
