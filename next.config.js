/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
  },
};

module.exports = nextConfig;
