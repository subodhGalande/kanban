import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserId } from "@/lib/getUser";

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { title, description } = await req.json();
    if (!title || !description) {
      return NextResponse.json(
        { message: "title and description required" },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        userId,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "server error " }, { status: 500 });
  }
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ tasks: [] }, { status: 200 });

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tasks });
  } catch {
    return NextResponse.json({ tasks: [] });
  }
}
