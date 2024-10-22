/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    env:{
        NEXT_PUBLIC_DSA_LOCAL: process.env.NEXT_PUBLIC_DSA_LOCAL
    },
    trailingSlash: true,
    output: 'export'
};

module.exports = nextConfig;
