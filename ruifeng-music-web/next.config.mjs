/** @type {import('next').NextConfig} */
const nextConfig = {
    // 启用react严格模式(可选)
    reactStrictMode: true,
    swcMinify: true,
    experimental: {
        cpus: 8,
    },
    images: {
        domains: [
            'picsum.photos',
            'fastly.picsum.photos',
            'img1.baidu.com',
            'via.placeholder.com',
            '172.21.160.1',
            'localhost',
            'n.sinaimg.cn',
        ],
    },
};

export default nextConfig;
