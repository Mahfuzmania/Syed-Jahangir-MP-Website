/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "abulkhairbhuiyan.com"
      },
      {
        protocol: "https",
        hostname: "img.youtube.com"
      }
    ]
  }
};

export default nextConfig;
