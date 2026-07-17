import { requireUser } from "@likiya/auth/server";
import { AccountNav } from "@/components/account/account-nav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="container-luxury grid gap-10 py-12 lg:grid-cols-[220px_1fr]">
      <AccountNav />
      <div>{children}</div>
    </div>
  );
}
