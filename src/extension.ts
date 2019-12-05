// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as fs from "fs";
import { getFileEnding, NotificationEnum } from "ov-language-server-types";
import * as path from "path";
import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient";
import { ClientCreator } from "./client-creator";
import { StatusBarExtension } from "./status-bar-extension";
import {
  getCulture,
  getCurrentOvDocumentUri,
  getLanguage,
  getCurrentOvDocument
} from "./util-functions";
import { createConverter } from "vscode-languageclient/lib/codeConverter";

var statusBarExtension: StatusBarExtension;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  statusBarExtension = new StatusBarExtension(context);
  statusBarExtension.createItems();

  let client: LanguageClient = ClientCreator.createClient(context);
  let disposable = client.start();

  vscode.workspace.onDidChangeConfiguration(
    (event: vscode.ConfigurationChangeEvent) => {
      var affected: boolean = event.affectsConfiguration("openVALIDATION");
      if (!affected) {
        return;
      }

      updateCultureAndLanguage(client);
    }
  );

  // vscode.workspace.onDidChangeTextDocument(event => {
  //   // TODO: Validate, if it actually was the schema.json
  //   if (event.document.languageId === "json") {
  //     client.sendNotification(
  //       "textDocument/didChange",
  //       createConverter().asChangeTextDocumentParams(event.document)
  //     );
  //   }
  // });

  // Start the client. This will also launch the server
  client.onReady().then(() => startUp(client));

  context.subscriptions.push(disposable);
}

function startUp(client: LanguageClient): void {
  updateCultureAndLanguage(client);

  client.onNotification(NotificationEnum.GeneratedCode, (params: any) =>
    handleGeneratedCodeNotification(params)
  );
}

function handleGeneratedCodeNotification(params: any) {
  let workspaceFolder: vscode.WorkspaceFolder[] | undefined =
    vscode.workspace.workspaceFolders;
  if (!workspaceFolder || workspaceFolder.length === 0) {
    return;
  }

  let rootPath: string = workspaceFolder[0].uri.fsPath;
  let jsonParams = JSON.parse(params);
  let folderPath: string = rootPath + "\\" + jsonParams.language;

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  // TODO: Add framework-Results

  fs.writeFile(
    path.join(
      folderPath,
      "implementationResult." + getFileEnding(jsonParams.language)
    ),
    jsonParams.value,
    (err: any) => {
      if (err) {
        return console.error(err);
      }
    }
  );
}

function updateCultureAndLanguage(client: LanguageClient): void {
  let uri: string = getCurrentOvDocumentUri();
  let culture: string = getCulture();
  client.sendNotification(NotificationEnum.CultureChanged, {
    culture: culture,
    uri: uri
  });
  statusBarExtension.updateCulture(culture);

  let language: string = getLanguage();
  client.sendNotification(NotificationEnum.LanguageChanged, {
    language: language,
    uri: uri
  });
  statusBarExtension.updateLanguage(language);
}

// this method is called when your extension is deactivated
export function deactivate() {}
