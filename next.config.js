/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "uploadthing.com",
      "utfs.io",
      "uploadthing-prod.s3.us-west-2.amazonaws.com",
    ],
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
