import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import UserMenu from "@/components/userMenu";
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

  const colors = ["#595762", "#899499", "#f0f0f5", "#eaa74e", "#db6060"];
  const avatarColor = colors[user.name.length % colors.length];

  return (
    <div className="min-h-screen flex flex-col justify-between font-sans  bg-gray-50">
      <header className="w-full bg-white border-b border-b-text/25 px-4 py-2 md:px-6 flex flex-row items-center justify-between gap-3 shadow-sm">
        <LogoutButton />
        <div className="flex  items-center justify-end gap-2 w-fit md:w-auto">
          <span className="text-sm font-medium text-heading">{user.name}</span>

          <UserMenu name={user.name} avatarColor={avatarColor} />
        </div>
      </header>

      <main className="flex-1 w-full px-4 py-6 md:px-6 lg:px-10">
        {children}
      </main>
    </div>
  );
}
