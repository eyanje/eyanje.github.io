define(["require", "exports", "../world/entity/dialogue/dialogue", "../data/resourcemanager"], function (require, exports, dialogue_1, resourcemanager_1) {
    "use strict";
    exports.__esModule = true;
    var TextBox = /** @class */ (function () {
        function TextBox(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.lineRead = 0;
            this.parts = new Array();
        }
        TextBox.prototype.hasLines = function () {
            return this.parts.length > 0;
        };
        TextBox.prototype.setVisible = function (visible) {
            if (visible !== this.visible) {
                this.lineRead = 0;
                if (visible) {
                    resourcemanager_1.playSound("audio/nextline.ogg");
                }
            }
            this.visible = visible;
        };
        TextBox.prototype.addLine = function (speaker, line) {
            this.parts.push(new dialogue_1.LinePair(speaker, line));
            //lines.add(new String[] { speaker, line });
            this.setVisible(true);
        };
        /**
         * Reads lines from an NPC and adds them to the dialogue box
         */
        TextBox.prototype.addNPCLines = function (npc, trigger) {
            var _this = this;
            var conv = npc.dialogueSet.dialogues.get(trigger).read();
            if (conv != null) {
                conv.parts.forEach(function (part) {
                    if (part instanceof dialogue_1.LineSet) {
                        var lineSet_1 = part;
                        if (lineSet_1 != null) {
                            // Get each fixed line
                            lineSet_1.getLinesyWidth(_this.width - 2 * TextBox.PADDING, '"default" ' + TextBox.FONT_SIZE + 'px').parts.forEach(function (line) {
                                _this.addLine(lineSet_1.speaker, line);
                            });
                        }
                    }
                    else {
                        _this.parts.push(part);
                    }
                });
            }
            this.setVisible(true);
        };
        /**
         * Reads lines from an NPC and adds them to the dialogue box
         */
        TextBox.prototype.addDialogueSet = function (set, trigger) {
            var _this = this;
            var conv = set.dialogues.get(trigger).read();
            if (conv) {
                conv.parts.forEach(function (part) {
                });
                conv.parts.forEach(function (part) {
                    if (part instanceof dialogue_1.LineSet) {
                        var lineSet_2 = part;
                        if (lineSet_2) {
                            // Get each fixed line
                            lineSet_2.getLinesyWidth(_this.width - 2 * TextBox.PADDING, '"default" ' + TextBox.FONT_SIZE + 'px').parts.forEach(function (line) {
                                _this.addLine(lineSet_2.speaker, line);
                            });
                        }
                    }
                    else {
                        // Add an action to the deque of conversation actions
                        _this.parts.push(part);
                    }
                });
            }
            this.setVisible(true);
        };
        TextBox.prototype.addAdjustedLine = function (speaker, line) {
            var _this = this;
            var lineSet = new dialogue_1.LineSet(speaker);
            lineSet.parts.push(line);
            lineSet.getLinesyWidth(this.width - 2 * TextBox.PADDING, '"default" ' + TextBox.FONT_SIZE + 'px').parts.forEach(function (adjustedLine) {
                _this.addLine(lineSet.speaker, adjustedLine);
            });
            this.setVisible(true);
        };
        TextBox.prototype.render = function (graphicsContext) {
            if (this.visible) {
                //String[] linePair = lines.peek();
                var part = this.parts[0];
                if (part && part instanceof dialogue_1.LinePair) {
                    var pair = part;
                    var speaker = pair.speaker;
                    var line = pair.line;
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
                        for (var textHeight = line.split("\n").length * (TextBox.FONT_SIZE * 3 / 2); textHeight + 2 * TextBox.PADDING > this.height; textHeight = line.split("\n").length * TextBox.FONT_SIZE * 3 / 2) {
                            //System.out.println("Shortening line " + line);
                            line = line.substring(line.indexOf('\n') + 1);
                        }
                        graphicsContext.fillText(line, this.x + TextBox.PADDING, this.y + TextBox.PADDING + TextBox.FONT_SIZE);
                    }
                    else {
                        this.setVisible(false);
                    }
                }
            }
        };
        TextBox.prototype.advanceChar = function () {
            if (this.parts.length > 0) {
                var current = this.parts[0];
                if (current instanceof dialogue_1.LinePair) {
                    var pair = current;
                    if (this.lineRead < pair.line.length) {
                        ++this.lineRead;
                    }
                }
            }
        };
        TextBox.prototype.advanceLine = function () {
            if (this.parts.length == 0) {
                this.setVisible(false);
            }
            else {
                var part = this.parts[0];
                // All current lines should be line pairs.
                if (part instanceof dialogue_1.LinePair) {
                    var pair = part;
                    if (this.lineRead < pair.line.length) {
                        // Skip to the end of the line
                        this.lineRead = pair.line.length;
                    }
                    else {
                        // Go to the next line
                        this.parts.shift();
                        part = this.parts[0];
                        // Find the next linepair
                        while (part && !(part instanceof dialogue_1.LinePair)) {
                            if (part instanceof dialogue_1.DialogueAction) {
                                // Consume a dialogue action if encountered
                                part.consume();
                            }
                            this.parts.shift();
                            part = this.parts[0];
                        }
                        // No LinePair parts exist
                        if (part && part instanceof dialogue_1.LinePair) {
                            // Move to the next line
                            this.lineRead = 0;
                            resourcemanager_1.playSound("audio/nextline.ogg");
                        }
                        else {
                            this.setVisible(false);
                        }
                    }
                }
                else {
                    this.setVisible(false);
                }
            }
        };
        TextBox.PADDING = 14;
        TextBox.CHAR_WIDTH = 14;
        TextBox.FONT_SIZE = 18;
        return TextBox;
    }());
    exports.TextBox = TextBox;
});
