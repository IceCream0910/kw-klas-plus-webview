
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  bundlePagesRouterDependencies: true,
  async redirects() {
    return [
      {
        source: '/favicon.ico',
        destination: 'https://icecream0910.github.io/kw-klas-plus-webview/public/favicon.ico',
        permanent: true,
        has: [
          {
            type: 'header',
            key: 'user-agent',
            value: '(?!.*webpack).*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
