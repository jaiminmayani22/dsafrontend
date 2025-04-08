/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    swcMinify: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    trailingSlash: true,
    output: 'export',
    // useFileSystemPublicRoutes: false,
};

module.exports = nextConfig;
