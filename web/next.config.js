/** @type {import('next').NextConfig} */

// Where the Next.js server proxies /api/* to (server-side; not exposed to the browser).
// Override per environment with API_PROXY_TARGET if the API moves.
const API_ORIGIN = process.env.API_PROXY_TARGET ?? "https://api.fit.fobs.dev";

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Same-origin proxy: the browser calls /api/v1/... on the web's own origin,
      // Next.js forwards it to the FIT API server-side. This avoids cross-origin
      // (CORS) requests entirely, so the app works from any host it is served on.
      { source: "/api/:path*", destination: `${API_ORIGIN}/api/:path*` },
    ];
  },
};

export default nextConfig;
