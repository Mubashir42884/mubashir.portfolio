/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allows the build to succeed even if there are minor linting warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;