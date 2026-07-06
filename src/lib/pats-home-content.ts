import { HERO_VIDEO_SRC } from "@/lib/cinematic-constants";
import { PATS_CROP } from "@/lib/media";

export const PATS_HOME_VIDEOS = [
  {
    id: "concept",
    href: "/operations",
    title: "PATS event layout and stations",
    category: "Operations",
    thumbnail: PATS_CROP.videoOperations,
  },
  {
    id: "field-gallery",
    href: "/gallery",
    title: "International edition field gallery",
    category: "Gallery",
    thumbnail: PATS_CROP.videoGallery,
  },
  {
    id: "team-spirit",
    href: "/#mission",
    title: "Concept and purpose of PATS",
    category: "Overview",
    thumbnail: PATS_CROP.videoConcept,
  },
] as const;

export { HERO_VIDEO_SRC };
