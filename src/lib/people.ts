import type { PersonEntry, PersonKind } from "@/lib/types";

function parts(iso: string) {
  const [year, month, day] = String(iso || "").split("-").map(Number);
  return { year: year || 0, month: month || 0, day: day || 0 };
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function isoDay(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function kindOf(value: string | undefined): PersonKind {
  if (value === "anniversary") return "anniversary";
  if (value === "recognition" || value === "shoutout" || value === "shout-out") return "recognition";
  return "birthday";
}

export function normalizePerson(person: Partial<PersonEntry> & { id?: string }): PersonEntry {
  const kind = kindOf(person.kind);
  const yearly = person.yearly ?? (kind === "birthday" || kind === "anniversary");
  return {
    id: person.id || `p_${Math.random().toString(36).slice(2, 9)}`,
    kind,
    name: String(person.name || "").trim(),
    date: String(person.date || ""),
    endDate: String(person.endDate || ""),
    message: String(person.message || ""),
    enabled: person.enabled !== false,
    yearly,
    photo: person.photo || "",
  };
}

export function personKicker(kind: PersonKind) {
  if (kind === "birthday") return "Happy birthday";
  if (kind === "anniversary") return "Work anniversary";
  return "Shout-out";
}

function daysUntilYearly(iso: string, today: Date) {
  const when = parts(iso);
  if (!when.month || !when.day) return 999;
  let event = new Date(today.getFullYear(), when.month - 1, when.day);
  if (startOfDay(event) < startOfDay(today)) event = new Date(today.getFullYear() + 1, when.month - 1, when.day);
  return Math.round((startOfDay(event) - startOfDay(today)) / 86_400_000);
}

export function isPersonLive(person: PersonEntry, today = new Date()) {
  if (!person.enabled || !person.name || !person.date) return false;
  const yearly = person.yearly ?? (person.kind === "birthday" || person.kind === "anniversary");
  if (yearly && (person.kind === "birthday" || person.kind === "anniversary")) {
    return daysUntilYearly(person.date, today) === 0;
  }
  const iso = isoDay(today);
  const start = person.date;
  const end = person.endDate || person.date;
  return iso >= start && iso <= end;
}

export function livePeople(people: PersonEntry[], today = new Date()) {
  return people.filter((person) => isPersonLive(normalizePerson(person), today));
}

export function upcomingPeople(people: PersonEntry[], today = new Date(), withinDays = 21) {
  return people
    .map(normalizePerson)
    .filter((person) => person.enabled && person.name && person.date && (person.kind === "birthday" || person.kind === "anniversary"))
    .map((person) => {
      const days = daysUntilYearly(person.date, today);
      const when = parts(person.date);
      const event = new Date(today.getFullYear(), when.month - 1, when.day);
      const shown = startOfDay(event) < startOfDay(today) ? new Date(today.getFullYear() + 1, when.month - 1, when.day) : event;
      return {
        person,
        days,
        whenLabel: shown.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      };
    })
    .filter((row) => row.days >= 0 && row.days <= withinDays)
    .sort((a, b) => a.days - b.days || a.person.name.localeCompare(b.person.name));
}

export function expiredShoutouts(people: PersonEntry[], today = new Date()) {
  const iso = isoDay(today);
  return people.filter((person) => {
    const item = normalizePerson(person);
    if (item.kind !== "recognition" || item.yearly) return false;
    const end = item.endDate || item.date;
    return Boolean(end) && end < iso;
  });
}

export function compressPersonPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 720;
      const scale = Math.min(1, max / Math.max(img.width || 1, img.height || 1));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not draw photo."));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that photo."));
    };
    img.src = url;
  });
}
