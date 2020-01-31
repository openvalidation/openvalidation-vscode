import * as vscode from "vscode";
import { LanguageEnum, CultureEnum } from "ov-language-server-types";
import { getCulture, getLanguage } from "./util-functions";

export class StatusBarExtension {
  private cultureStatusBar: vscode.StatusBarItem;
  private languageStatusBar: vscode.StatusBarItem;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.languageStatusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      1
    );
    this.cultureStatusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      1
    );
  }

  public createItems() {
    this.createLanguageItem();
    this.createCultureItem();
  }

  private createLanguageItem() {
    // create a new status bar item that we can now manage
    this.languageStatusBar.command = "language.popup";
    this.context.subscriptions.push(this.languageStatusBar);
    this.updateLanguage();

    let languageItems = this.generateQuickPickItemsForLanguage();

    this.context.subscriptions.push(
      vscode.commands.registerCommand("language.popup", function() {
        vscode.window.showQuickPick(languageItems).then(result => {
          for (let [key, value] of Object.entries(LanguageEnum)) {
            if (!!result && result.label === key) {
              vscode.workspace
                .getConfiguration("openVALIDATION")
                .update("language", value);
              break;
            }
          }
        });
      })
    );
  }

  private generateQuickPickItemsForLanguage(): vscode.QuickPickItem[] {
    let returnList: vscode.QuickPickItem[] = [];

    for (let [key,] of Object.entries(LanguageEnum)) {
      returnList.push(<vscode.QuickPickItem>{
        label: key,
        description: `Changes the language to ${key}`
      });
    }

    return returnList;
  }

  private createCultureItem() {
    // create a new status bar item that we can now manage
    this.cultureStatusBar.command = "culture.popup";
    this.context.subscriptions.push(this.cultureStatusBar);
    this.updateCulture();

    let cultureItems = this.generateQuickPickItemsForCulture();

    this.context.subscriptions.push(
      vscode.commands.registerCommand("culture.popup", function() {
        vscode.window.showQuickPick(cultureItems).then(result => {
          for (let [key, value] of Object.entries(CultureEnum)) {
            if (!!result && result.label === key) {
              vscode.workspace
                .getConfiguration("openVALIDATION")
                .update("culture", value);
              break;
            }
          }
        });
      })
    );
  }

  private generateQuickPickItemsForCulture(): vscode.QuickPickItem[] {
    let returnList: vscode.QuickPickItem[] = [];

    for (let [key,] of Object.entries(CultureEnum)) {
      returnList.push(<vscode.QuickPickItem>{
        label: key,
        description: `Changes the culture to ${key}`
      });
    }

    return returnList;
  }

  public updateLanguage(language: string = getLanguage()): void {
    var languageTuple = Object.entries(LanguageEnum).find(
      cul => cul[1] === language
    );
    if (!languageTuple) {
      return;
    }

    this.languageStatusBar.text = `openVALIDATION: ${language}`;
    this.languageStatusBar.show();
  }

  public updateCulture(culture: string = getCulture()): void {
    var cultureTuple = Object.entries(CultureEnum).find(
      cul => cul[1] === culture
    );
    if (!cultureTuple) {
      return;
    }

    this.cultureStatusBar.text = `openVALIDATION: ${cultureTuple[0]}`;
    this.cultureStatusBar.show();
  }
}
