/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The editor is served as a static page from /public/editor.html and embedded via iframe,
  // so it stays framework-agnostic and can also be hosted standalone for embed.js.
  experimental: {
    serverComponentsExternalPackages: ["@imgly/background-removal-node", "sharp"],
  },
};
export default nextConfig;