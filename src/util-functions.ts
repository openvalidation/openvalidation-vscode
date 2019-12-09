import * as fs from "fs";
import {
  CultureEnum,
  getFileEnding,
  ICodeNotification,
  LanguageEnum
} from "ov-language-server-types";
import * as path from "path";
import * as vscode from "vscode";

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

export function handleGeneratedCodeNotification(params: any) {
  let workspaceFolder: vscode.WorkspaceFolder[] | undefined =
    vscode.workspace.workspaceFolders;
  if (!workspaceFolder || workspaceFolder.length === 0) {
    return;
  }

  let rootPath: string = workspaceFolder[0].uri.fsPath;
  let jsonParams = JSON.parse(params) as ICodeNotification;
  let folderPath: string = rootPath + "\\" + jsonParams.language;

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  fs.writeFile(
    path.join(
      folderPath,
      "implementationResult." +
        getFileEnding(jsonParams.language as LanguageEnum)
    ),
    jsonParams.implementation,
    (err: any) => {
      if (err) {
        return console.error(err);
      }
    }
  );
  fs.writeFile(
    path.join(
      folderPath,
      "frameworkResult." + getFileEnding(jsonParams.language as LanguageEnum)
    ),
    jsonParams.framework,
    (err: any) => {
      if (err) {
        return console.error(err);
      }
    }
  );
}
