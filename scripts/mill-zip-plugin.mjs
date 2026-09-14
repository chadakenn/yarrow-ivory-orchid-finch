import { millEnv, handleMillRequest, startWatchdog, runPython, PY_WORK, PY_MEDIA } from "./mill-http.mjs";

export function millZipPlugin() {
  return {
    name: "mill-zip-plugin",
    enforce: "pre",
    apply: "serve",
    async configureServer(server) {
      millEnv();
      startWatchdog();
      setTimeout(() => {
        runPython(PY_WORK, ["health"]).catch(() => {});
        runPython(PY_MEDIA, ["migrate"]).catch(() => {});
      }, 8000);

      server.middlewares.use(async (req, res, next) => {
        const handled = await handleMillRequest(req, res, {
          restart: () => server.restart(),
          root: server.config.root,
        });
        if (!handled) next();
      });
    },
  };
}
