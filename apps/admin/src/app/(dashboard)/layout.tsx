import { requireStaff } from "@likiya/auth/server";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireStaff("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar userLabel={profile.full_name ?? "Staff"} />
        <main className="flex-1 bg-secondary/20 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
