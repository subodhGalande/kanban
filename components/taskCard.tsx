"use client";

import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function TaskCard({ task, onEdit, onDelete }: any) {
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

  // close dropdown on outside click
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
      className=" p-3 font-sans rounded-xl bg-white shadow-sm relative cursor-grab active:cursor-grabbing touch-none"
    >
      <div className="flex -mt-2 justify-between items-center">
        <div className="mt-2 mb-2">
          <div
            className={`
            text-[10px] px-2 py-1 rounded font-medium
            ${
              task.priority === "HIGH"
                ? "bg-danger/15 text-danger"
                : task.priority === "MEDIUM"
                ? "bg-warning/15 text-warning "
                : "bg-success/15 text-success "
            }
          `}
          >
            {task.priority}
          </div>
        </div>

        {/* Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu((prev) => !prev);
            }}
            className="p-1 text-heading text-xl leading-none rounded hover:bg-gray-100"
          >
            ⋯
          </button>

          {openMenu && (
            <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-xl z-30">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(false);
                  onEdit(task);
                }}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-card-background"
              >
                Edit
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(false);
                  onDelete(task);
                }}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-card-background text-danger"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <h3 className="font-medium mt-1 text-heading">{task.title}</h3>
      <p className="text-xs text-text">{task.description}</p>
    </div>
  );
}
