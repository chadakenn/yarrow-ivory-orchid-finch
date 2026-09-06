import { defineEventHandler, setHeader } from "h3";
import { readPiStats } from "../../../scripts/mill-pi.mjs";

export default defineEventHandler(async (event) => {
  setHeader(event, "cache-control", "no-store");
  return await readPiStats();
});
