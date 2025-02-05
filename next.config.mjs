/** @type {import('next').NextConfig} */
const nextConfig = {
  env: process.env.NODE_ENV === 'development' ? {
    NEXT_PUBLIC_TEST_USER_EMAIL: process.env.NEXT_PUBLIC_TEST_USER_EMAIL,
    NEXT_PUBLIC_TEST_USER_PASSWORD: process.env.NEXT_PUBLIC_TEST_USER_PASSWORD,
  } : {},
  reactStrictMode: false,
  productionBrowserSourceMaps: true,
  webpack: (config, { dev, isServer }) => {
    // Enable source maps in development
    if (dev) {
      config.devtool = 'eval-source-map';
      // Ignore source map warnings
      config.ignoreWarnings = [
        { module: /node_modules\/.+\?/, message: /Cannot find source map/ },
        { message: /Could not read source map/ }
      ];
    }
    return config;
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    domains: ['*'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: '*' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' }
        ],
      },
    ];
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Important: return the modified config
    config.module.rules.push({
      test: /\.mjs$/,
      enforce: 'pre',
      use: ['source-map-loader'],
    });

    // Prevent auth-store from being compiled on the server
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        './auth-store': false,
      };
    }

    return config;
  },
};

export default nextConfig;
