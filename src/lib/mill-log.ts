export async function millEvent(event: string, detail = "") {
  try {
    await fetch("/api/mill-log", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event, detail }),
    });
  } catch {
    /* mill still works if the log miss lands */
  }
}
