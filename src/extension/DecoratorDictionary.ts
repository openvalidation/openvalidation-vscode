import * as vscode from "vscode";

export class DecoratorDictionary {
  private dictionary: { [details: string]: vscode.Range[] } = {};

  public add(key: string, range: vscode.Range) {
    if (!this.dictionary[key]) {
      this.dictionary[key] = [];
    }

    this.dictionary[key].push(range);
  }

  public get(): { [details: string]: vscode.Range[] } {
    return this.dictionary;
  }
}
