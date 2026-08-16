import { redirect } from "next/navigation";
import { currentUser } from "@/lib/permissions";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata = { title: "Admin" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await currentUser();
  if (!me) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-base lg:flex">
      <AdminSidebar userName={me.name || "Gestor"} role={me.role} />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
