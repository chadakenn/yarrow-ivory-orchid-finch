import { dirname, join } from "node:path";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
//#region scripts/mill-workspace.mjs
var SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "mill-workspace.py");
var ROOT = process.cwd();
var MAX_BYTES = 83886080;
/** @param {string[]} args */
function runPython(args) {
	return new Promise((resolve, reject) => {
		const child = spawn("python3", [SCRIPT, ...args], { cwd: ROOT });
		let out = "";
		let err = "";
		child.stdout.on("data", (chunk) => {
			out += chunk;
		});
		child.stderr.on("data", (chunk) => {
			err += chunk;
		});
		child.on("close", (code) => {
			if (code !== 0) {
				reject(new Error((err || out || "zip failed").trim()));
				return;
			}
			resolve(out.trim());
		});
	});
}
async function packMillWorkspace() {
	const dir = await mkdtemp(join(tmpdir(), "mill-pack-"));
	const dest = join(dir, "north-baltimore-mill-workspace.zip");
	try {
		await runPython([
			"pack",
			ROOT,
			dest
		]);
		return await readFile(dest);
	} finally {
		await rm(dir, {
			recursive: true,
			force: true
		});
	}
}
/** @param {Buffer} buffer @param {string} [filename] */
async function installMillWorkspace(buffer, filename = "upload.zip") {
	if (!buffer?.length) throw new Error("Choose a mill zip.");
	if (buffer.length > MAX_BYTES) throw new Error("That zip is too large.");
	const dir = await mkdtemp(join(tmpdir(), "mill-install-"));
	const zipPath = join(dir, filename.replace(/[^\w.-]+/g, "_") || "upload.zip");
	try {
		await writeFile(zipPath, buffer);
		const raw = await runPython([
			"install",
			zipPath,
			ROOT
		]);
		return JSON.parse(raw);
	} finally {
		await rm(dir, {
			recursive: true,
			force: true
		});
	}
}
var MILL_ZIP_NAME = "north-baltimore-mill-workspace.zip";
//#endregion
export { installMillWorkspace as n, packMillWorkspace as r, MILL_ZIP_NAME as t };
