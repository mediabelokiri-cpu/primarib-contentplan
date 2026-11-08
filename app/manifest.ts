import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prima RIB Talent — Content Planner & Script",
    short_name: "Prima RIB Talent",
    description: "Portal jadwal tayang konten, panduan naskah shooting, dan SOP Talent Prima RIB",
    start_url: "/talent",
    display: "standalone",
    background_color: "#284078",
    theme_color: "#284078",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
