import * as fs from "fs";
import {
  CultureEnum,
  getFileEnding,
  ICodeNotification,
  LanguageEnum
} from "ov-language-server-types";
import * as path from "path";
import * as vscode from "vscode";
import {
  LanguageClient,
  DidChangeTextDocumentNotification
} from "vscode-languageclient";
import { createConverter } from "vscode-languageclient/lib/codeConverter";
import { ovLanguageId } from "./constants";

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

export function getCodeGenerationPath(): string | undefined {
  let workspaceFolder: vscode.WorkspaceFolder[] | undefined =
    vscode.workspace.workspaceFolders;
  let rootPath: string | undefined;
  if (!workspaceFolder || workspaceFolder.length === 0) {
    if (
      !vscode.workspace
        .getConfiguration("openVALIDATION")
        .get("codGeneration.path")
    ) {
      return undefined;
    }
    rootPath = vscode.workspace
      .getConfiguration("openVALIDATION")
      .get("codGeneration.path");
  } else {
    if (
      !vscode.workspace
        .getConfiguration("openVALIDATION")
        .get("codGeneration.path")
    ) {
      rootPath = workspaceFolder[0].uri.fsPath;
    }
    rootPath = vscode.workspace
      .getConfiguration("openVALIDATION")
      .get("codGeneration.path");
  }
  return rootPath;
}

export function getCurrentOvDocument(): vscode.TextDocument | undefined {
  if (
    !!vscode.window.activeTextEditor &&
    vscode.window.activeTextEditor.document.languageId === ovLanguageId
  ) {
    return vscode.window.activeTextEditor.document;
  }

  var document = vscode.workspace.textDocuments.find(document => {
    return document.languageId === "openVALIDATION";
  });
  return document;
}

export function getCurrentOvDocumentUri(): string {
  var ovDocument = getCurrentOvDocument();
  return !ovDocument ? "" : ovDocument.uri.toString();
}

export function validateCurrentOvDocument(client: LanguageClient): void {
  let ovDocument = getCurrentOvDocument();
  if (!!ovDocument) {
    client.sendNotification(
      DidChangeTextDocumentNotification.type,
      createConverter().asChangeTextDocumentParams(ovDocument)
    );
  }
}

export function handleGeneratedCodeNotification(params: any) {
  let jsonParams = JSON.parse(params) as ICodeNotification;
  let folderPath: string = getCodeGenerationPath() + "\\" + jsonParams.language;

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
