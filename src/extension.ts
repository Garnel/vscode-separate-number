'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let worker = new NumberSeparatWorker();
    let disposable = vscode.commands.registerCommand('separate-number.toggle', () => {
        var editor = vscode.window.activeTextEditor;
        if (editor) {
            var range = editor.document.getWordRangeAtPosition(editor.selection.active);
            var word = editor.document.getText(range);
            var numbers = word.match(/\d[_\d]+/g);
            if (!numbers) {
                return;
            }
            var newNumber;
            numbers.forEach(function(number) {
                word = word.replace(number, worker.toggleNumber(number));
            });
            editor.edit((editBuilder) => {
                editBuilder.replace(range, word);
            });
        }
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(worker);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

/**
 * NumberSeparatWorker
 */
class NumberSeparatWorker {
    separator: string = '_';
    constructor(separator: string = '_') {
        this.separator = separator;
    }

    toggleNumber(number: string): string {
        var pos = number.indexOf(this.separator);
        if (pos == -1) { // no separator
            return this.separateNumber(number);
        } else if (pos > 0 && pos <= 3) {
            var newPos = number.indexOf(this.separator, pos + 1);
            while (newPos == pos + 3 + this.separator.length) {
                pos = newPos;
                newPos = number.indexOf(this.separator, pos + 1);
            }
            if (newPos == -1 && pos == number.length - 3 - this.separator.length) {
                return this.unseparateNumber(number);
            }
        }

        return number;
    }

    separateNumber(number: string): string {
        if (typeof number === 'string') {
            var length = number.length;
            if (length <= 3) {
                return number;
            }
            var start = length % 3;
            var result = start > 0 ? number.substring(0, start) : '';
            for (var i = start; i < length; i += 3) {
                if (i > 0) {
                    result += this.separator;
                }
                result += number.substring(i, i + 3);
            }
            return result;
        }
        return '';
    }

    unseparateNumber(number_with_separator): string {
        return number_with_separator.split(this.separator).join('');
    }

    dispose() {}
}