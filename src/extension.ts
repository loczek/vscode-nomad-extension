import { commands, ExtensionContext, workspace } from "vscode";

import {
  Executable,
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";
import { Commands } from "./constants";
import { downloadLanguageServer, getLocalBinaryUri } from "./download";

let client: LanguageClient;

export async function activate(context: ExtensionContext) {
  console.log("Starting");

  await workspace.fs.createDirectory(context.globalStorageUri);

  let binaryURI = getLocalBinaryUri();

  if (!binaryURI) {
    binaryURI = await downloadLanguageServer(context);
  }

  if (!binaryURI) {
    throw new Error("nomad-ls binary not found");
  }

  console.log(`Using nomad-ls located at: ${binaryURI.fsPath}`);

  const executable: Executable = {
    command: binaryURI.fsPath, // this gets launched with `--stdio` argument
  };

  const serverOptions: ServerOptions = {
    run: executable,
    debug: executable,
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      {
        scheme: "file",
        language: "nomad-acl",
      },
      {
        scheme: "file",
        language: "nomad-agent",
      },
      {
        scheme: "file",
        language: "nomad-volume-csi",
      },
      {
        scheme: "file",
        language: "nomad-volume-dynamic-host",
      },
      {
        scheme: "file",
        language: "nomad-job",
      },
      {
        scheme: "file",
        language: "nomad-namespace",
      },
      {
        scheme: "file",
        language: "nomad-node-pool",
      },
      {
        scheme: "file",
        language: "nomad-resource-quota",
      },
      {
        scheme: "file",
        language: "nomad-variable",
      },
    ],
  };

  client = new LanguageClient(
    "nomad-ls",
    "Nomad Language Server",
    serverOptions,
    clientOptions,
  );

  const disposable = commands.registerCommand(
    Commands.ShowLanguageServerLogs,
    () => {
      client.outputChannel.show();
    },
  );

  context.subscriptions.push(disposable);

  client.start();
}

export async function deactivate() {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
