import KanbanBoard from "@/components/kanbanBoard";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const token = (await cookies()).get("auth_token")?.value;
  const payload = await verifyToken(token!);

  const tasks = await prisma.task.findMany({
    where: { userId: payload?.id as string },
    orderBy: { createdAt: "desc" },
  });

  return <KanbanBoard tasks={tasks} />;
}
