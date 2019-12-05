import * as vscode from "vscode";
import { CultureEnum, LanguageEnum } from "ov-language-server-types";

export function getCulture(): string {
  var culture: string = vscode.workspace.getConfiguration("openVALIDATION")
    .culture;
  if (!culture) {
    culture = CultureEnum.English;
  }
  return culture;
}

export function getLanguage(): string {
  var language = vscode.workspace.getConfiguration("openVALIDATION").language;
  if (!language) {
    language = LanguageEnum.JavaScript;
  }
  return language;
}

export function getCurrentOvDocument(): vscode.TextDocument | undefined {
  var document = vscode.workspace.textDocuments.find(document => {
    return document.languageId === "openVALIDATION";
  });
  return document;
}

export function getCurrentOvDocumentUri(): string {
  var ovDocument = getCurrentOvDocument();
  return !ovDocument ? "" : ovDocument.uri.toString();
}
