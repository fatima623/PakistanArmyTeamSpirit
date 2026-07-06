import { loadPublicChrome } from "@/components/public/load-public-chrome";
import { PublicLayoutClient } from "@/components/public/PublicLayoutClient";

export async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { nav, footer, siteTicker } = await loadPublicChrome();

  return (
    <PublicLayoutClient
      siteTicker={siteTicker}
      nav={nav}
      footer={footer}
    >
      {children}
    </PublicLayoutClient>
  );
}
