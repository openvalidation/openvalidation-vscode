import * as path from "path";
import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from "vscode-languageclient";

export class ClientCreator {
  public static createClient(context: vscode.ExtensionContext): LanguageClient {
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
    return new LanguageClient(
      "ovLanguageServer",
      "OV Language Server",
      serverOptions,
      clientOptions
    );
  }
}
