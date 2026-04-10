const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname)
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com"
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com"
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com"
      }
    ]
  }
}

module.exports = nextConfig
