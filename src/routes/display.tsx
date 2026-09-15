import { createFileRoute } from "@tanstack/react-router";
import { TvDisplay } from "@/components/display/TvDisplay";

export const Route = createFileRoute("/display")({ ssr: false, component: Display });

function Display() {
  return <TvDisplay />;
}
