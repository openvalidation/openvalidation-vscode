// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as fs from "fs";
import {
  CultureEnum,
  getFileEnding,
  LanguageEnum,
  NotificationEnum
} from "ov-language-server-types";
import * as path from "path";
import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from "vscode-languageclient";

var cultureStatusBar: vscode.StatusBarItem;
var languageStatusBar: vscode.StatusBarItem;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // The server is implemented in node
  let serverModule = context.asAbsolutePath(
    path.join(
      "node_modules",
      "ov-language-server",
      "dist",
      "start-ipc-server.js"
    )
  );

  // The debug options for the server
  // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
  let debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  let serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions
    }
  };

  // Options to control the language client
  let clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents

    documentSelector: [{ scheme: "file", language: "openVALIDATION" }],
    outputChannelName: "OV Language Server",
    synchronize: {
      // Notify the server about file changes to '.clientrc files contained in the workspace
      fileEvents: vscode.workspace.createFileSystemWatcher("**/.clientrc")
    }
  };

  // Create the language client and start the client.
  let client = new LanguageClient(
    "ovLanguageServer",
    "OV Language Server",
    serverOptions,
    clientOptions
  );

  vscode.workspace.onDidChangeConfiguration(
    (event: vscode.ConfigurationChangeEvent) => {
      var affected: boolean = event.affectsConfiguration("openVALIDATION");
      if (!affected) {
        return;
      }

      updateCultureAndLanguage(client);
    }
  );

  // Start the client. This will also launch the server
  let disposable = client.start();

  client.onReady().then(() => {
    client.sendNotification(NotificationEnum.SchemaChanged, {
      schema: '{ "Testdecimal": 20 }',
      uri: ""
    });
    updateCultureAndLanguage(client);

    client.onNotification(NotificationEnum.GeneratedCode, (params: any) => {
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
        function(err: any) {
          if (err) {
            return console.error(err);
          }
        }
      );
    });
  });

  context.subscriptions.push(disposable);

  // create a new status bar item that we can now manage
  languageStatusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  languageStatusBar.command = "language.popup";
  languageStatusBar.text = "language";
  context.subscriptions.push(languageStatusBar);
  languageStatusBar.show();

  let languageItems = generateQuickPickItemsForLanguage();

  context.subscriptions.push(
    vscode.commands.registerCommand("language.popup", function() {
      vscode.window.showQuickPick(languageItems).then(result => {
        for (let [key, value] of Object.entries(LanguageEnum)) {
          if (!result || result.label !== key) {
            continue;
          }

          vscode.workspace
            .getConfiguration("openVALIDATION")
            .update("language", value);
          break;
        }
      });
    })
  );

  // create a new status bar item that we can now manage
  cultureStatusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  cultureStatusBar.command = "culture.popup";
  cultureStatusBar.text = "culture";
  context.subscriptions.push(cultureStatusBar);
  cultureStatusBar.show();

  let cultureItems = generateQuickPickItemsForCulture();

  context.subscriptions.push(
    vscode.commands.registerCommand("culture.popup", function() {
      vscode.window.showQuickPick(cultureItems).then(result => {
        for (let [key, value] of Object.entries(CultureEnum)) {
          if (!result || result.label !== key) {
            continue;
          }

          vscode.workspace
            .getConfiguration("openVALIDATION")
            .update("culture", value);
          break;
        }
      });
    })
  );
}

function generateQuickPickItemsForLanguage(): vscode.QuickPickItem[] {
  let returnList: vscode.QuickPickItem[] = [];

  for (let [key, value] of Object.entries(LanguageEnum)) {
    returnList.push(<vscode.QuickPickItem>{
      label: key,
      description: `Changes the language to ${key}`
    });
  }

  return returnList;
}

function generateQuickPickItemsForCulture(): vscode.QuickPickItem[] {
  let returnList: vscode.QuickPickItem[] = [];

  for (let [key, value] of Object.entries(CultureEnum)) {
    returnList.push(<vscode.QuickPickItem>{
      label: key,
      description: `Changes the culture to ${key}`
    });
  }

  return returnList;
}

function updateCultureAndLanguage(client: LanguageClient): void {
  let culture: string = getCulture();
  client.sendNotification(NotificationEnum.CultureChanged, {
    culture: culture,
    uri: ""
  });
  // TODO: Get the "beautified" string from the enum
  cultureStatusBar.text = culture;
  cultureStatusBar.show();

  let language: string = getLanguage();
  client.sendNotification(NotificationEnum.LanguageChanged, {
    language: language,
    uri: ""
  });
  // TODO: Get the "beautified" string from the enum
  languageStatusBar.text = language;
  languageStatusBar.show();
}

function getCulture(): string {
  var culture: string = vscode.workspace.getConfiguration("openVALIDATION")
    .culture;
  if (!culture) {
    culture = CultureEnum.English;
  }
  return culture;
}

function getLanguage(): string {
  var language = vscode.workspace.getConfiguration("openVALIDATION").language;
  if (!language) {
    language = LanguageEnum.JavaScript;
  }
  return language;
}

// this method is called when your extension is deactivated
export function deactivate() {}
