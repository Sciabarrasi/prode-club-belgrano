/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["flagcdn.com"],
    unoptimized: true,
  },
}

export default nextConfig
