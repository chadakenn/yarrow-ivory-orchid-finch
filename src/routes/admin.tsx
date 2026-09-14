import { createFileRoute } from "@tanstack/react-router";
import { ControlRoom } from "@/components/control/ControlRoom";

export const Route = createFileRoute("/admin")({ ssr: false, component: Admin });

function Admin() {
  return <ControlRoom room="admin" />;
}
