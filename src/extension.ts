// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from "path";
import * as vscode from "vscode";
import * as fs from "fs";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from "vscode-languageclient";

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
    client.sendNotification("textDocument/schemaChanged", {
      schema: '{ "Testdecimal": 20 }',
      uri: ""
    });
    updateCultureAndLanguage(client);

    client.onNotification("textDocument/generatedCode", (params: any) => {
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
}

function updateCultureAndLanguage(client: LanguageClient): void {
  client.sendNotification("textDocument/cultureChanged", {
    culture: getCulture(),
    uri: ""
  });
  client.sendNotification("textDocument/languageChanged", {
    language: getLanguage(),
    uri: ""
  });
}

function getCulture(): string {
  var culture: string = vscode.workspace.getConfiguration("openVALIDATION")
    .culture;
  if (!culture) {
    culture = "en";
  }
  return culture;
}

function getLanguage(): string {
  var language = vscode.workspace.getConfiguration("openVALIDATION").language;
  if (!language) {
    language = "Java";
  }
  return language;
}

/**
 * Generates the default file ending for the given language
 *
 * @export
 * @param {LanguageEnum} language programming-language
 * @returns {string} default file ending for the language
 */
function getFileEnding(language: string): string {
  switch (language) {
    case "Java":
      return "java";
    case "CSharp":
      return "cs";
    case "JavaScript":
    case "Node":
      return "js";
    case "Python":
      return "py";
    default:
      return "";
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
