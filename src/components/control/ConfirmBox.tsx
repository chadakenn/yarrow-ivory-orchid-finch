import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConfirmSpec = {
  title: string;
  body: string;
  items?: string[];
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
};

export function ConfirmBox({ spec, onCancel }: { spec: ConfirmSpec; onCancel: () => void }) {
  return (
    <div className={cn("confirm-box", spec.danger && "danger")} role="alertdialog">
      <h3>{spec.title}</h3>
      <p>{spec.body}</p>
      {spec.items?.length ? (
        <ul>
          {spec.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      <div className="header-actions">
        <Button variant={spec.danger ? "danger" : "primary"} onClick={spec.onConfirm}>
          {spec.confirmLabel}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
