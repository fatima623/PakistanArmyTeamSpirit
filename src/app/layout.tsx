import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  Barlow_Condensed,
  Bebas_Neue,
  DM_Sans,
  Inter,
  JetBrains_Mono,
  Oswald,
  Roboto_Mono,
} from "next/font/google";
import localFont from "next/font/local";

import { ClientToaster } from "@/components/ClientToaster";
import { Providers } from "@/components/providers";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/branding";
import {
  DEFAULT_SITE_THEME,
  parseSiteTheme,
  SITE_THEME_COOKIE,
} from "@/lib/site-theme";
import "./globals.css";

const geist = localFont({
  src: [{ path: "../../public/fonts/GeistVF.woff2", weight: "100 900" }],
  variable: "--font-geist",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "Segoe UI", "sans-serif"],
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-bebas",
  weight: "400",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["300", "400", "500"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: SITE_NAME,
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon-32x32.png", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialSiteTheme = parseSiteTheme(
    cookieStore.get(SITE_THEME_COOKIE)?.value ?? DEFAULT_SITE_THEME
  );
  const dayThemeClass =
    initialSiteTheme === "day" ? "site-theme-day light-theme" : "";

  return (
    <html
      lang="en"
      data-site-theme={initialSiteTheme}
      data-scroll-behavior="smooth"
      className={`${geist.variable} ${oswald.variable} ${barlow.variable} ${bebas.variable} ${inter.variable} ${robotoMono.variable} ${dmSans.variable} ${jetbrains.variable} ${dayThemeClass}`}
      suppressHydrationWarning
    >
      <body
        className={`${inter.className} min-h-screen bg-brand-parchment font-sans antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/(?:^|; )${SITE_THEME_COOKIE}=(day|night)/);var portal=/^\\/event\\/(dashboard|payment|edit|team|tickets|timeline)/.test(location.pathname);var t=portal?"day":(m?m[1]:"night");var d=t==="day";document.documentElement.dataset.siteTheme=t;document.documentElement.classList.toggle("site-theme-day",d);document.documentElement.classList.toggle("light-theme",d);}catch(e){}})();document.documentElement.classList.add("page-loading");`,
          }}
        />
        <Providers initialSiteTheme={initialSiteTheme}>{children}</Providers>
        <ClientToaster />
      </body>
    </html>
  );
}
