/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@reactly/shared"],
  // Required for Cloudflare Pages deployment
  images: {
    unoptimized: true, // Or use Cloudflare Images for optimization
  },
};

export default nextConfig;
