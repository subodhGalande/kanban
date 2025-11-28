"use client";

import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function TaskCard({ task, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task.id,
      animateLayoutChanges: () => false,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
  };

  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="p-3 border rounded bg-white shadow-sm relative"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{task.title}</h3>

        {/* Three dot menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu((prev) => !prev);
            }}
            className="px-2 py-0 text-gray-600 text-xl leading-none"
          >
            ⋯
          </button>

          {openMenu && (
            <div className="absolute right-0 mt-1 w-28 bg-white border rounded shadow-md z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(false);
                  onEdit(task);
                }}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
              >
                Edit
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(false);
                  onDelete(task);
                }}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-red-600"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-1 mb-1">
        <span
          className={`
    text-[10px] px-2 py-1 rounded 
    ${task.priority === "HIGH" ? "bg-red-100 text-red-700" : ""}
    ${task.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-700" : ""}
    ${task.priority === "LOW" ? "bg-green-100 text-green-700" : ""}
  `}
        >
          {task.priority}
        </span>
      </div>

      <p className="text-sm text-gray-600">{task.description}</p>
    </div>
  );
}
