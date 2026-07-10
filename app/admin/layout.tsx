import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");

  const user = session.user as { name?: string | null; role?: string };

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <AdminSidebar userName={user.name || "Admin"} role={user.role || "EDITOR"} />
      <div className="flex-1 min-w-0 p-6 sm:p-10">{children}</div>
    </div>
  );
}
