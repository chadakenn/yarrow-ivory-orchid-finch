import { createFileRoute } from "@tanstack/react-router";
import { ControlRoom } from "@/components/control/ControlRoom";

export const Route = createFileRoute("/control")({ component: Control });

function Control() {
  return <ControlRoom />;
}
