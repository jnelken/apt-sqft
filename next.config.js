/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // External packages for server components
  serverExternalPackages: [],
  
  // TypeScript configuration
  typescript: {
    // Type checking is handled by your editor/CI
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration  
  eslint: {
    // ESLint is handled by your editor/CI
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;