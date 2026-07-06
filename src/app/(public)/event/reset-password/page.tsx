import { PatsPageHero } from "@/components/pats/PatsPageHero";
import { ResetPasswordForm } from "@/components/public/ResetPasswordForm";

type Props = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;

  return (
    <>
      <PatsPageHero
        eyebrow="Account recovery"
        title="Set new password"
        subtitle="Choose a strong password for your participant account."
      />
      <ResetPasswordForm token={token ?? ""} />
    </>
  );
}
