import "./globals.css";

/**
 * Root layout is intentionally a pass-through: the real `<html>`/`<body>` live in
 * `app/[lang]/layout.tsx` so the `lang` attribute can be set per locale. The only
 * route mounted directly under this layout is `app/page.tsx`, which redirects to
 * the default locale before rendering.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
