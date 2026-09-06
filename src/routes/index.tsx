import { createFileRoute } from "@tanstack/react-router";
import { TvDisplay } from "@/components/display/TvDisplay";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <TvDisplay />;
}
