const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['shared', 'services', 'three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
  experimental: {
    turbo: {
      root: path.resolve(__dirname, '../../'),
    },
  },
};

module.exports = nextConfig;
