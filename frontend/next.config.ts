import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/dashboard/students/registration",
        destination: "/dashboard/students?register=1",
        permanent: false,
      },
      {
        source: "/dashboard/students/profiles",
        destination: "/dashboard/students",
        permanent: false,
      },
      {
        source: "/dashboard/admissions/applications",
        destination: "/dashboard/admissions?new=1",
        permanent: false,
      },
      {
        source: "/dashboard/courses/create",
        destination: "/dashboard/courses?new=1",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
