/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'images.squarespace-cdn.com',
          },
          {
            protocol: 'https',
            hostname: 'upcdn.io',
          },
        ],
        
      },
};

export default nextConfig;
