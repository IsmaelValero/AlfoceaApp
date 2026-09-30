import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Fotos y PDFs de manuales subidos por el administrador.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
