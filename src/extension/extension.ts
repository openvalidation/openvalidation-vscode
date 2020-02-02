// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { NotificationEnum, SyntaxToken } from "ov-language-server-types";
import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient";
import { ClientCreator } from "./client-creator";
import { ovLanguageId } from "./constants";
import { DecoratorDictionary } from "./DecoratorDictionary";
import { getDecoratorTypes, getSpecificDecorator, ScopeEnum } from "./semantic-highlighting";
import { StatusBarExtension } from "./status-bar-extension";
import { getCodeGenerationPath, getCulture, getCurrentOvDocumentUri, getLanguage, handleGeneratedCodeNotification, validateCurrentOvDocument } from "./util-functions";

let statusBarExtension: StatusBarExtension;
let client: LanguageClient;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  statusBarExtension = new StatusBarExtension(context);
  statusBarExtension.createItems();

  setCodeGenerationPathToWorkspace();

  client = ClientCreator.createClient(context);
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

  vscode.workspace.onDidChangeTextDocument(event => {
    // TODO: Validate only, if it actually was the used schema
    if (event.document.languageId === "json") {
      validateCurrentOvDocument(client);
    }
  });

  vscode.window.onDidChangeActiveTextEditor(event => {
    if (!event || event.document.languageId !== ovLanguageId) {
      return;
    }

    validateCurrentOvDocument(client);
  });

  // Start the client. This will also launch the server
  client.onReady().then(() => startUp(client));

  context.subscriptions.push(disposable);
}

function startUp(client: LanguageClient): void {
  updateCultureAndLanguage(client);

  client.onNotification(NotificationEnum.GeneratedCode, (params: any) =>
    handleGeneratedCodeNotification(params)
  );

  client.onNotification(
    NotificationEnum.SemanticHighlighting,
    (parameter: any) => {
      let activeEditor = vscode.window.activeTextEditor;
      const tokenList = JSON.parse(parameter) as SyntaxToken[];
      if (!!activeEditor && activeEditor.document.languageId === ovLanguageId) {
        for (const iterator of getDecoratorTypes()) {
          activeEditor.setDecorations(iterator, []);
        }

        var decorations = new DecoratorDictionary();
        for (var token of tokenList) {
          if (!token.range) {
            continue;
          }

          var range = new vscode.Range(
            token.range.start.line,
            token.range.start.character,
            token.range.end.line,
            token.range.end.character
          );
          decorations.add(token.pattern, range);
        }

        for (let [key, value] of Object.entries(decorations.get())) {
          console.log(`${key}: ${value}`);
          activeEditor.setDecorations(
            getSpecificDecorator(key as ScopeEnum),
            value
          );
        }
      }
    }
  );

  client.onNotification(
    NotificationEnum.CommentKeywordChanged,
    (params: string) => {
      vscode.languages.setLanguageConfiguration("openVALIDATION", {
        comments: {
          lineComment: params as string
        }
      });
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

function setCodeGenerationPathToWorkspace(): void {
  var codeGenerationPath: string | undefined = getCodeGenerationPath();
  if (!codeGenerationPath || codeGenerationPath.trim() === "") {
    let workspaceFolder: vscode.WorkspaceFolder[] | undefined =
      vscode.workspace.workspaceFolders;
    if (!workspaceFolder || workspaceFolder.length === 0) {
      return;
    }
    vscode.workspace
      .getConfiguration("openVALIDATION")
      .update("codeGeneration.path", workspaceFolder[0].uri.fsPath);
  }
}

// this method is called when your extension is deactivated
export function deactivate() {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
