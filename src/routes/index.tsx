import { createFileRoute, redirect } from "@tanstack/react-router";

function isMillTvHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "display.local" || host === "display";
}

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: isMillTvHost() ? "/display" : "/office" });
  },
});
