import { i as defineEventHandler, o as getHeader, r as createError, s as readRawBody } from "../../_libs/h3+rou3+srvx.mjs";
import { n as installMillWorkspace } from "../../_chunks/mill-workspace.mjs";
//#region server/routes/api/mill-workspace.post.ts
var mill_workspace_post_default = defineEventHandler(async (event) => {
	const body = await readRawBody(event, false);
	if (!body?.length) throw createError({
		statusCode: 400,
		statusMessage: "Choose a mill zip."
	});
	try {
		const filename = getHeader(event, "x-filename") || "upload.zip";
		return await installMillWorkspace(Buffer.from(body), filename);
	} catch (err) {
		throw createError({
			statusCode: 400,
			statusMessage: err instanceof Error ? err.message : "Could not install that zip."
		});
	}
});
//#endregion
export { mill_workspace_post_default as default };
