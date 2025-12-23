/** @type {import('next').NextConfig} */
const nextConfig = {
  // We need to allow the PDF viewer worker to load
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;