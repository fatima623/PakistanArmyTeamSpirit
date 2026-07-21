import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      // Gallery video is served same-origin from /uploads; blob: covers the
      // admin's local preview of a file before it is uploaded.
      "media-src 'self' blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  /** Hides the Next.js “N” dev badge (e.g. “Video / Animations”) in local preview */
  devIndicators: false,
  images: {
    // AVIF is ~20-30% smaller than WebP; browsers that lack it fall back to WebP.
    formats: ["image/avif", "image/webp"],
    // Cache optimized images for 31 days (default is 60s).
    minimumCacheTTL: 2678400,
    qualities: [25, 50, 75, 92, 95, 100],
  },
  experimental: {
    scrollRestoration: true,
    // Requests that pass through middleware are buffered with a 10MB default
    // cap; anything larger is truncated and `request.formData()` fails to parse.
    // Gallery video uploads allow up to 128MB (MAX_GALLERY_VIDEO_BYTES) plus a
    // poster image and form fields, so the whole multipart body needs headroom.
    middlewareClientMaxBodySize: "160mb",
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "recharts",
      "gsap",
      "sonner",
    ],
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  async headers() {
    // CSP on dev breaks hot reload style injection in some browsers; production only.
    if (process.env.NODE_ENV !== "production") {
      return [];
    }
    // Inline PDF routes need permissive object-src so the browser can render in-tab.
    const inlinePdfHeaders = [
      { key: "X-DNS-Prefetch-Control", value: "on" },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      {
        key: "Content-Security-Policy",
        value: "default-src 'none'; object-src 'self'",
      },
    ];
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/api/admin/news-pdf/:path*",
        headers: inlinePdfHeaders,
      },
      {
        source: "/api/news-pdf/:path*",
        headers: inlinePdfHeaders,
      },
    ];
  },
};

export default nextConfig;
