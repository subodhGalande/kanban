"use client";

import { useDroppable } from "@dnd-kit/core";

export default function Column({ id, children }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      id={id}
      className="border rounded p-4 bg-gray-50 min-h-[400px]"
    >
      {children}
    </div>
  );
}
