import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { ResetPasswordForm } from "@/components/public/ResetPasswordForm";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type Props = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const { t, locale, dir } = await getDictionary();
  const R = t.publicSite.resetPassword;

  return (
    <div lang={locale} dir={dir}>
      <PatsPageHero
        eyebrow={R.hero.eyebrow}
        title={R.hero.title}
        subtitle={R.hero.subtitle}
      />
      <ResetPasswordForm token={token ?? ""} />
    </div>
  );
}
