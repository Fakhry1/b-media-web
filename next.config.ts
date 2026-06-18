import type { NextConfig } from "next";

// Allow self-signed certificates when proxying to the local backend in development
if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const BACKEND = process.env.API_URL ?? "https://localhost:44344";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // All /api/* calls from the browser are proxied through Next.js to the backend.
        // This avoids CORS and self-signed-certificate issues in the browser.
        source: "/api/:path*",
        destination: `${BACKEND}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
