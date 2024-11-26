/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    trailingSlash: true,
    output: 'export',
    useFileSystemPublicRoutes: false,
};

module.exports = nextConfig;
