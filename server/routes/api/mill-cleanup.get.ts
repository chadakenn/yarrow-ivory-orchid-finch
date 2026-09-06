import { defineEventHandler, setHeader } from "h3";
import { listMillTemp } from "../../../scripts/mill-workspace.mjs";

export default defineEventHandler(async (event) => {
  setHeader(event, "cache-control", "no-store");
  return await listMillTemp();
});
