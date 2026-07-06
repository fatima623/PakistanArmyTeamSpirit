import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    token: string;
  }>;
};

export default async function LegacyResetPasswordPage({ params }: Props) {
  const { token } = await params;
  redirect(`/event/reset-password?token=${encodeURIComponent(token)}`);
}
