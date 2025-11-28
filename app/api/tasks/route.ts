import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserId } from "@/lib/getUser";

// --------------------------- CREATE TASK ---------------------------

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("📦 Received body:", body);

    const { title, description, priority } = body;

    // Validate fields
    if (!title || !description) {
      return NextResponse.json(
        { message: "Title and description are required" },
        { status: 400 }
      );
    }

    // Validate priority enum with default fallback
    const validPriorities = ["LOW", "MEDIUM", "HIGH"];
    const taskPriority =
      priority && validPriorities.includes(priority) ? priority : "MEDIUM";

    console.log("✅ Creating task with priority:", taskPriority);

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: taskPriority,
        status: "TODO",
        userId,
      },
    });

    console.log("✅ Task created:", task);

    return NextResponse.json({ task }, { status: 201 });
  } catch (err: any) {
    console.error("🔥 TASK CREATE ERROR:");
    console.error("Error message:", err?.message);
    console.error("Error stack:", err?.stack);
    console.error("Full error:", err);

    return NextResponse.json(
      {
        message: "Server error",
        error: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}

// ----------------------------- GET TASKS -----------------------------

export async function GET() {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ tasks: [] }, { status: 200 });
    }

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Fallback: ensure tasks missing priority return MEDIUM
    const sanitized = tasks.map((t) => ({
      ...t,
      priority: t.priority || "MEDIUM",
    }));

    return NextResponse.json({ tasks: sanitized }, { status: 200 });
  } catch (err: any) {
    console.error("🔥 TASK FETCH ERROR:", err);
    return NextResponse.json(
      { message: "Server error", error: err?.message },
      { status: 500 }
    );
  }
}
