import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import LogoutButton from "@/components/logoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("auth_token")?.value;

  if (!token) {
    redirect("/login", RedirectType.replace);
  }

  let user = null;

  if (token) {
    const payload = await verifyToken(token);
    if (payload?.id) {
      user = await prisma.user.findUnique({
        where: { id: payload.id as string },
        select: { id: true, name: true, email: true },
      });
    }
  }

  if (!user) {
    redirect("/login", RedirectType.replace);
  }
  return (
    <div>
      <header className="p-4 border-b flex justify-between">
        <div className="font-semibold text-lg">Dashboard</div>
        <LogoutButton />
        {user ? (
          <div className="text-sm">
            Logged in as <span className="font-medium">{user.name}</span>
          </div>
        ) : (
          <div className="text-sm text-red-600">Not logged in</div>
        )}
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
}
