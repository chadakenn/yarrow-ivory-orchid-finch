import { Camera, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { compressPersonPhoto, isPersonLive, personKicker } from "@/lib/people";
import { flushKioskNow } from "@/lib/kiosk-sync";
import { useDisplayStore } from "@/lib/store";
import type { PersonEntry, PersonKind } from "@/lib/types";

const EMPTY: Omit<PersonEntry, "id"> = {
  kind: "birthday",
  name: "",
  date: "",
  endDate: "",
  message: "",
  enabled: true,
  yearly: true,
  photo: "",
};

export function PeoplePanel() {
  const people = useDisplayStore((s) => s.people);
  const addPerson = useDisplayStore((s) => s.addPerson);
  const updatePerson = useDisplayStore((s) => s.updatePerson);
  const removePerson = useDisplayStore((s) => s.removePerson);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const yearlyDefault = form.kind === "birthday" || form.kind === "anniversary";

  const save = () => {
    if (!form.name.trim() || !form.date) {
      toast.error("Name and date are required.");
      return;
    }
    const payload = {
      ...form,
      name: form.name.trim(),
      yearly: form.kind === "recognition" ? Boolean(form.yearly) : form.yearly !== false,
    };
    if (editing) {
      updatePerson(editing, payload);
      toast.success("Person updated.");
    } else {
      addPerson(payload);
      toast.success("Added to the people playlist.");
    }
    setForm(EMPTY);
    setEditing(null);
    void flushKioskNow();
  };

  const pickPhoto = async (file: File | undefined) => {
    if (!file) return;
    try {
      const photo = await compressPersonPhoto(file);
      setForm((prev) => ({ ...prev, photo }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read that photo.");
    }
  };

  return (
    <section className="control-page">
      <header className="control-header">
        <div>
          <p className="eyebrow">People</p>
          <h1>Birthdays and shout-outs</h1>
          <p className="lede">
            Add a photo and a date. Birthdays and anniversaries can repeat every year. Shout-outs stay on the TV between the dates you set.
          </p>
        </div>
      </header>

      <div className="panel">
        <h2>{editing ? "Edit person" : "Add person"}</h2>
        <div className="people-form">
          <button
            type="button"
            className="photo-picker"
            onClick={() => photoRef.current?.click()}
          >
            {form.photo ? <img src={form.photo} alt="" /> : <Camera size={22} />}
            <span>{form.photo ? "Change photo" : "Add photo"}</span>
          </button>
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void pickPhoto(file);
            }}
          />
          <div className="form-grid">
            <label>
              <Label>Kind</Label>
              <select
                className="select"
                value={form.kind}
                onChange={(event) => {
                  const kind = event.target.value as PersonKind;
                  setForm((prev) => ({
                    ...prev,
                    kind,
                    yearly: kind === "recognition" ? false : true,
                  }));
                }}
              >
                <option value="birthday">Birthday</option>
                <option value="anniversary">Anniversary</option>
                <option value="recognition">Shout-out</option>
              </select>
            </label>
            <label>
              <Label>Name</Label>
              <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
            </label>
            <label>
              <Label>{form.kind === "recognition" ? "Starts" : "Date"}</Label>
              <Input type="date" value={form.date} onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))} />
            </label>
            {form.kind === "recognition" ? (
              <label>
                <Label>Ends</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
                />
              </label>
            ) : null}
            <label className="full">
              <Label>Message</Label>
              <Textarea
                value={form.message}
                onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              />
            </label>
          </div>
        </div>
        <label className="check-row">
          <input
            type="checkbox"
            checked={form.yearly ?? yearlyDefault}
            onChange={(event) => setForm((prev) => ({ ...prev, yearly: event.target.checked }))}
          />
          Repeat every year
        </label>
        <div className="header-actions" style={{ marginTop: 14 }}>
          <Button onClick={save}>{editing ? "Save person" : "Add person"}</Button>
          {editing ? (
            <Button
              variant="ghost"
              onClick={() => {
                setEditing(null);
                setForm(EMPTY);
              }}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </div>

      <div className="people-list">
        {people.map((person) => {
          const live = isPersonLive(person);
          return (
            <div key={person.id} className="people-card people-row">
              {person.photo ? <img src={person.photo} alt="" className="people-thumb" /> : <div className="people-thumb empty" />}
              <div>
                <div className="people-kind">
                  {personKicker(person.kind)}
                  {live ? " · on TV today" : ""}
                  {person.yearly ? " · yearly" : ""}
                </div>
                <div className="people-name">{person.name}</div>
                <div className="people-meta">
                  {person.date}
                  {person.endDate ? ` → ${person.endDate}` : ""}
                </div>
                {person.message ? <p className="lede">{person.message}</p> : null}
              </div>
              <div className="people-actions">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => updatePerson(person.id, { enabled: !person.enabled })}
                >
                  {person.enabled ? "On" : "Off"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(person.id);
                    setForm({
                      kind: person.kind,
                      name: person.name,
                      date: person.date,
                      endDate: person.endDate,
                      message: person.message,
                      enabled: person.enabled,
                      yearly: person.yearly,
                      photo: person.photo || "",
                    });
                  }}
                >
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => removePerson(person.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
