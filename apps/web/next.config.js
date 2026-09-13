const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['shared', 'services'],
  experimental: {
    turbo: {
      root: path.resolve(__dirname, '../../'),
    },
  },
};

module.exports = nextConfig;
