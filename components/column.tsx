"use client";

import { useDroppable } from "@dnd-kit/core";

export default function Column({ id, children }: any) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      id={id}
      className="rounded-xl p-4 bg-card-background sm:min-h-[520px]"
    >
      {children}
    </div>
  );
}
