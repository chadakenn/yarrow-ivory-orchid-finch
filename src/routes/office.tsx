import { createFileRoute } from "@tanstack/react-router";
import { ControlRoom } from "@/components/control/ControlRoom";

export const Route = createFileRoute("/office")({ component: Office });

function Office() {
  return <ControlRoom />;
}
