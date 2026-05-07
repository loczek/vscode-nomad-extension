import { createWriteStream } from "node:fs";
import path from "node:path";
import * as tar from "tar";
import { ExtensionContext, Uri, workspace } from "vscode";
import which from "which";
import * as yauzl from "yauzl";

export async function downloadLanguageServer(context: ExtensionContext) {
  const platform = getPlatform(process.platform);
  const arch = getArch(process.arch);

  const binaryURI = `nomad-ls_${platform}_${arch}${platform === "windows" ? ".zip" : ".tar.gz"}`;
  const url = `https://github.com/loczek/nomad-ls/releases/latest/download/${binaryURI}`;
  const compressed = Uri.joinPath(context.globalStorageUri, binaryURI);

  const response = await fetch(url);
  const blob = await response.arrayBuffer();

  await workspace.fs.writeFile(compressed, Buffer.from(blob));

  if (platform === "windows") {
    await extractZip(compressed.fsPath, context.globalStorageUri.fsPath);
  } else {
    await extractTarGz(compressed.fsPath, context.globalStorageUri.fsPath);
  }

  const binaryName = `nomad-ls${platform === "windows" ? ".exe" : ""}`;
  const dest = Uri.joinPath(context.globalStorageUri, binaryName);

  return dest;
}

async function extractTarGz(
  archivePath: string,
  destDir: string,
): Promise<void> {
  await tar.extract({
    file: archivePath,
    cwd: destDir,
  });
}

function extractZip(archivePath: string, destDir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    yauzl.open(archivePath, { lazyEntries: true }, (err, zip) => {
      if (err || !zip) {
        return reject(err);
      }

      zip.readEntry();

      zip.on("entry", (entry) => {
        zip.openReadStream(entry, (err, stream) => {
          if (err || !stream) {
            return reject(err);
          }
          const dest = path.join(destDir, entry.fileName);
          stream.pipe(createWriteStream(dest));
          stream.on("end", () => zip.readEntry());
        });
      });

      zip.on("end", resolve);
      zip.on("error", reject);
    });
  });
}

function getPlatform(
  platform: NodeJS.Platform,
): Exclude<NodeJS.Platform, "win32"> | "windows" {
  if (platform === "win32") {
    return "windows";
  }

  return platform;
}

function getArch(arch: NodeJS.Architecture): string {
  if (arch === "x64") {
    return "amd64";
  }

  return arch;
}

export function getBinaryUri(context: ExtensionContext): Uri {
  const platform = getPlatform(process.platform);
  const binaryName = `nomad-ls${platform === "windows" ? ".exe" : ""}`;

  const dest = Uri.joinPath(context.globalStorageUri, binaryName);

  return dest;
}

export function getLocalBinaryUri(): Uri | null {
  const platform = getPlatform(process.platform);
  const binaryName = `nomad-ls${platform === "windows" ? ".exe" : ""}`;
  const binary = which.sync(binaryName, { nothrow: true });

  if (binary) {
    return Uri.parse(binary);
  }

  return null;
}

export function getResolvedBinaryUri(context: ExtensionContext): Uri {
  const platform = getPlatform(process.platform);
  const binaryName = `nomad-ls${platform === "windows" ? ".exe" : ""}`;

  const binary = which.sync(binaryName, { nothrow: true });

  if (binary) {
    return Uri.parse(binary);
  }

  const dest = Uri.joinPath(context.globalStorageUri, binaryName);
  return dest;
}
