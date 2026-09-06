import { defineEventHandler, setHeader } from "h3";
import { MILL_ZIP_NAME, packMillWorkspace } from "../../../scripts/mill-workspace.mjs";

export default defineEventHandler(async (event) => {
  const zip = await packMillWorkspace();
  setHeader(event, "content-type", "application/zip");
  setHeader(event, "content-disposition", `attachment; filename="${MILL_ZIP_NAME}"`);
  setHeader(event, "cache-control", "no-store");
  return zip;
});
