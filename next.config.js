/** @type {import('next').NextConfig} */
const nextConfig = {
  // for static site generation (WARNING: don't turn on, nextAuth will go brrr!)
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
