/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@workspace/ui",
    "@prepaid-gas/core",
    "@prepaid-gas/data",
    "@prepaid-gas/constants"
  ],
  webpack: (config, { isServer }) => {
    // Help webpack resolve the symlinked packages
    config.resolve.symlinks = true;
    
    // Add fallback for node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Polyfill browser-only APIs for SSR
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Provide empty polyfills for browser-only APIs
        indexedDB: false,
      };
    }

    return config;
  },
}

export default nextConfig
