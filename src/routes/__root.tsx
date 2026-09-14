import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { KioskSync } from "@/lib/kiosk-sync";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

const APP_NAME = "Breakroom Display";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      { name: "theme-color", content: "#0b0f14" },
      {
        name: "description",
        content: "North Baltimore 50 TPH mill communications hub — production, people, and mill conquest.",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Cinzel:wght@600;700;800&family=Cinzel+Decorative:wght@700;900&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <KioskSync />
          <Outlet />
        </AuthProvider>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#18212c",
              border: "1px solid color-mix(in oklab, #e8edf3 12%, transparent)",
              color: "#e8edf3",
            },
          }}
        />
        <Scripts />
      </body>
    </html>
  ),
});
