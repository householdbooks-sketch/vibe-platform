import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for better Cloudflare Workers compatibility
  output: "export",
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Configure trailing slash behavior
  trailingSlash: false,
  
  // Optimize for edge deployment
  experimental: {
    // Add any valid experimental features here if needed
  },
};

export default nextConfig;
