import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AnnouncementDetailPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/announcements?selected=${encodeURIComponent(slug)}`);
}
