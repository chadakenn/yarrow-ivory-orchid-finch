import { readPiStats } from "./mill-pi.mjs";
import { cleanMillTemp, installMillWorkspace, listMillTemp, MILL_ZIP_NAME, packMillWorkspace } from "./mill-workspace.mjs";

function send(res, status, body, headers = {}) {
  const payload = Buffer.isBuffer(body) ? body : Buffer.from(body);
  res.statusCode = status;
  for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
  res.setHeader("content-length", String(payload.byteLength));
  res.end(payload);
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("That zip is too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export function millZipPlugin() {
  return {
    name: "mill-workspace-zip",
    enforce: "pre",
    configureServer(server) {
      server.middlewares.stack.unshift({
        route: "",
        handle: async function millWorkspaceZip(req, res, next) {
          const pathOnly = (req.url ?? "").split("?", 1)[0];
          const method = (req.method ?? "GET").toUpperCase();
          try {
            if (method === "GET" && pathOnly === "/api/mill-workspace.zip") {
              const zip = await packMillWorkspace();
              send(res, 200, zip, {
                "content-type": "application/zip",
                "content-disposition": `attachment; filename="${MILL_ZIP_NAME}"`,
                "cache-control": "no-store",
              });
              return;
            }
            if (method === "GET" && pathOnly === "/api/mill-pi") {
              const result = await readPiStats();
              send(res, 200, JSON.stringify(result), { "content-type": "application/json", "cache-control": "no-store" });
              return;
            }
            if (method === "GET" && pathOnly === "/api/mill-cleanup") {
              const result = await listMillTemp();
              send(res, 200, JSON.stringify(result), { "content-type": "application/json", "cache-control": "no-store" });
              return;
            }
            if (method === "POST" && pathOnly === "/api/mill-cleanup") {
              const result = await cleanMillTemp();
              send(res, 200, JSON.stringify(result), { "content-type": "application/json", "cache-control": "no-store" });
              return;
            }
            if (method === "POST" && pathOnly === "/api/mill-workspace") {
              const buf = await readBody(req, 80 * 1024 * 1024);
              const filename = String(req.headers["x-filename"] ?? "upload.zip");
              const result = await installMillWorkspace(buf, filename);
              send(res, 200, JSON.stringify(result), { "content-type": "application/json" });
              return;
            }
          } catch (err) {
            send(res, 400, err instanceof Error ? err.message : "Could not use that zip.");
            return;
          }
          next();
        },
      });
    },
  };
}
