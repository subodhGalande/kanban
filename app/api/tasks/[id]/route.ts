import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserId } from "@/lib/getUser";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const { title, description, status } = await req.json();

    const task = await prisma.task.update({
      where: { id },
      data: { title, description, status },
    });

    return NextResponse.json({ task });
  } catch {
    return NextResponse.json({ message: "failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = params;

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Task deleted" });
  } catch {
    return NextResponse.json({ message: "Failed to delete" }, { status: 500 });
  }
}
