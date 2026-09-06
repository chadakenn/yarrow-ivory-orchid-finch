import { createError, defineEventHandler, getHeader, readRawBody } from "h3";
import { installMillWorkspace } from "../../../scripts/mill-workspace.mjs";

export default defineEventHandler(async (event) => {
  const body = await readRawBody(event, false);
  if (!body?.length) {
    throw createError({ statusCode: 400, statusMessage: "Choose a mill zip." });
  }
  try {
    const filename = getHeader(event, "x-filename") || "upload.zip";
    return await installMillWorkspace(Buffer.from(body), filename);
  } catch (err) {
    throw createError({
      statusCode: 400,
      statusMessage: err instanceof Error ? err.message : "Could not install that zip.",
    });
  }
});
