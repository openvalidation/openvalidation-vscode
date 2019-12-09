import * as vscode from "vscode";
import { LanguageEnum, CultureEnum } from "ov-language-server-types";
import { getCulture, getLanguage } from "./util-functions";

export class StatusBarExtension {
  private cultureStatusBar: vscode.StatusBarItem;
  private languageStatusBar: vscode.StatusBarItem;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.languageStatusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.cultureStatusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
  }

  public createItems() {
    this.createLanguageItem();
    this.createCultureItem();
  }

  private createLanguageItem() {
    // create a new status bar item that we can now manage
    this.languageStatusBar.command = "language.popup";
    this.languageStatusBar.text = getLanguage();
    this.context.subscriptions.push(this.languageStatusBar);
    this.languageStatusBar.show();

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

    for (let [key, value] of Object.entries(LanguageEnum)) {
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
    this.cultureStatusBar.text = getCulture();
    this.context.subscriptions.push(this.cultureStatusBar);
    this.cultureStatusBar.show();

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

    for (let [key, value] of Object.entries(CultureEnum)) {
      returnList.push(<vscode.QuickPickItem>{
        label: key,
        description: `Changes the culture to ${key}`
      });
    }

    return returnList;
  }

  public updateLanguage(language: string): void {
    // TODO: Get the "beautified" string from the enum
    this.languageStatusBar.text = language;
    this.languageStatusBar.show();
  }

  public updateCulture(culture: string): void {
    // TODO: Get the "beautified" string from the enum
    this.cultureStatusBar.text = culture;
    this.cultureStatusBar.show();
  }
}
