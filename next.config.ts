import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // 在生产构建中忽略ESLint错误，允许即使有ESLint错误也能构建成功
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 在生产构建中忽略TypeScript错误，允许即使有类型错误也能构建成功
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
