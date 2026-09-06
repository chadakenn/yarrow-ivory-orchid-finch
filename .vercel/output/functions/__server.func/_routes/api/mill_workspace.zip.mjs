import { c as setHeader, i as defineEventHandler } from "../../_libs/h3+rou3+srvx.mjs";
import { r as packMillWorkspace, t as MILL_ZIP_NAME } from "../../_chunks/mill-workspace.mjs";
//#region server/routes/api/mill-workspace.zip.get.ts
var mill_workspace_zip_get_default = defineEventHandler(async (event) => {
	const zip = await packMillWorkspace();
	setHeader(event, "content-type", "application/zip");
	setHeader(event, "content-disposition", `attachment; filename="${MILL_ZIP_NAME}"`);
	setHeader(event, "cache-control", "no-store");
	return zip;
});
//#endregion
export { mill_workspace_zip_get_default as default };
