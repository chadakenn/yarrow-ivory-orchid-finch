import type { PersonEntry, PersonKind } from "@/lib/types";

export const PERSON_KINDS: Array<{ id: PersonKind; label: string }> = [
  { id: "birthday", label: "Birthday" },
  { id: "anniversary", label: "Anniversary" },
  { id: "shoutout", label: "Shout-out" },
];

export function normalizePerson(raw: Partial<PersonEntry> & { kind?: string }): PersonEntry {
  const kind: PersonKind =
    raw.kind === "birthday" || raw.kind === "anniversary" || raw.kind === "shoutout"
      ? raw.kind
      : "shoutout";
  const yearly = kind === "birthday" || kind === "anniversary" || raw.yearly === true;
  return {
    id: raw.id || `p_${Math.random().toString(36).slice(2, 9)}`,
    kind,
    name: String(raw.name ?? "").trim(),
    date: String(raw.date ?? "").slice(0, 10),
    endDate: String(raw.endDate ?? "").slice(0, 10),
    message: String(raw.message ?? ""),
    photo: String(raw.photo ?? ""),
    yearly,
    enabled: raw.enabled !== false,
  };
}

function parts(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return { year: year || 0, month: month || 0, day: day || 0 };
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function occursOn(month: number, day: number, year: number) {
  if (month === 2 && day === 29) {
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    return leap ? { month: 2, day: 29 } : { month: 2, day: 28 };
  }
  return { month, day };
}

function daysFromEvent(today: Date, month: number, day: number) {
  const occ = occursOn(month, day, today.getFullYear());
  const event = startOfDay(new Date(today.getFullYear(), occ.month - 1, occ.day));
  return Math.round((startOfDay(today) - event) / 86_400_000);
}

export function yearsOfService(hireDate: string, today = new Date()) {
  const hire = parts(hireDate);
  if (!hire.year || !hire.month || !hire.day) return 0;
  let years = today.getFullYear() - hire.year;
  const passed =
    today.getMonth() + 1 > hire.month ||
    (today.getMonth() + 1 === hire.month && today.getDate() >= hire.day);
  if (!passed) years -= 1;
  return Math.max(0, years);
}

function mdStamp(month: number, day: number) {
  return month * 100 + day;
}

function inYearlyRange(today: Date, startIso: string, endIso: string) {
  const start = parts(startIso);
  const finish = parts(endIso || startIso);
  if (!start.month || !start.day) return false;
  const t = mdStamp(today.getMonth() + 1, today.getDate());
  const a = mdStamp(start.month, start.day);
  const b = mdStamp(finish.month, finish.day);
  if (a <= b) return t >= a && t <= b;
  return t >= a || t <= b;
}

export function isPersonLive(person: PersonEntry, today = new Date()) {
  if (!person.enabled || !person.name) return false;
  const yearly = person.yearly || person.kind === "birthday" || person.kind === "anniversary";
  if (person.kind === "birthday" || person.kind === "anniversary" || (person.kind === "shoutout" && yearly && !person.endDate)) {
    const when = parts(person.date);
    if (!when.month || !when.day) return false;
    if (person.kind === "anniversary" && yearsOfService(person.date, today) < 1) return false;
    const delta = daysFromEvent(today, when.month, when.day);
    return delta >= -1 && delta <= 1;
  }
  if (person.kind === "shoutout" && yearly && person.endDate) {
    return inYearlyRange(today, person.date, person.endDate);
  }
  const iso = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
  const start = person.date || iso;
  const end = person.endDate || addDays(start, 7);
  return iso >= start && iso <= end;
}

function addDays(iso: string, count: number) {
  const when = parts(iso);
  const date = new Date(when.year, when.month - 1, when.day + count);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function livePeople(people: PersonEntry[], today = new Date()) {
  return people.filter((person) => isPersonLive(person, today));
}

export function expiredShoutouts(people: PersonEntry[], today = new Date()) {
  const iso = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
  return people.filter((person) => {
    if (person.kind !== "shoutout" || person.yearly) return false;
    const end = person.endDate || addDays(person.date || iso, 7);
    return Boolean(end) && end < iso;
  });
}

export function personKindLabel(kind: PersonKind) {
  if (kind === "birthday") return "Birthday";
  if (kind === "anniversary") return "Anniversary";
  return "Shout-out";
}

export function personKicker(person: PersonEntry) {
  if (person.kind === "birthday") return "Happy birthday";
  if (person.kind === "anniversary") {
    const years = yearsOfService(person.date);
    return years ? `Work anniversary · ${years} year${years === 1 ? "" : "s"}` : "Work anniversary";
  }
  return "Mill shout-out";
}

export function personDefaultMessage(person: PersonEntry) {
  if (person.kind === "birthday") return "Wishing you a great birthday from the North Baltimore mill.";
  if (person.kind === "anniversary") {
    const years = yearsOfService(person.date);
    return years
      ? `Thank you for ${years} year${years === 1 ? "" : "s"} at North Baltimore.`
      : "Thank you for your years at North Baltimore.";
  }
  return "Thank you for your hard work.";
}

export function personWhenLabel(person: PersonEntry, today = new Date()) {
  if (!person.date) return "No date";
  const when = parts(person.date);
  const pretty = new Date(2000, when.month - 1, when.day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  if (person.kind === "birthday") return `Every ${pretty}`;
  if (person.kind === "anniversary") {
    const years = yearsOfService(person.date, today);
    return `${pretty} · hired ${when.year}${years ? ` · ${years} yrs` : ""}`;
  }
  if (person.yearly) {
    const end = person.endDate ? parts(person.endDate) : null;
    const endPretty = end
      ? new Date(2000, end.month - 1, end.day).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "";
    return endPretty ? `Every year ${pretty} – ${endPretty}` : `Every year on ${pretty}`;
  }
  const end = person.endDate ? ` – ${person.endDate}` : " · 7 days";
  return `${person.date}${end}`;
}

export function personStatus(person: PersonEntry, today = new Date()) {
  if (!person.enabled) return "Off";
  if (isPersonLive(person, today)) return "On TV today";
  return "Saved";
}

export async function compressPersonPhoto(file: File) {
  const bitmap = await createImageBitmap(file);
  const max = 720;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that photo.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}
