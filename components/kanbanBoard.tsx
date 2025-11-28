"use client";

import { useState } from "react";
import axios from "axios";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskCard from "./taskCard";
import CreateTaskModal from "./createTaskModal";
import Column from "./column";
import { DragOverlay } from "@dnd-kit/core";
import EditTaskModal from "./editTaskModal";
import DeleteTaskModal from "./deleteTaskModal";
import { Search, ArrowUpDown, ListFilter } from "lucide-react";

type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
type Priority = "LOW" | "MEDIUM" | "HIGH";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
}

interface KanbanBoardProps {
  tasks: Task[];
}

export default function KanbanBoard({ tasks }: KanbanBoardProps) {
  const [taskList, setTaskList] = useState(tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | TaskStatus>("ALL");
  const [sortBy, setSortBy] = useState<"NEW" | "OLD" | "AZ" | "ZA">("NEW");

  const visibleTasks = taskList
    .filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        filterStatus === "ALL" ? true : t.status === filterStatus;

      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "AZ") return a.title.localeCompare(b.title);
      if (sortBy === "ZA") return b.title.localeCompare(a.title);
      return 0;
    });

  // Pointer + Touch sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  const columns: Record<TaskStatus, Task[]> = {
    TODO: [],
    IN_PROGRESS: [],
    REVIEW: [],
    DONE: [],
  };

  visibleTasks.forEach((t) => columns[t.status].push(t));

  const columnTitles: Record<TaskStatus, string> = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    REVIEW: "Review",
    DONE: "Done",
  };

  const onDragStart = (event: DragStartEvent) => {
    const id = event.active.id;
    const task = visibleTasks.find((t) => t.id === id);
    setActiveTask(task || null);
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const draggedId = active.id as string;
    const draggedTask = visibleTasks.find((t) => t.id === draggedId);
    if (!draggedTask) return;

    let newStatus: TaskStatus;

    if (["TODO", "IN_PROGRESS", "REVIEW", "DONE"].includes(over.id as string)) {
      newStatus = over.id as TaskStatus;
    } else {
      const targetTask = visibleTasks.find((t) => t.id === over.id);
      if (!targetTask) return;
      newStatus = targetTask.status;
    }

    if (draggedTask.status === newStatus) {
      setActiveTask(null);
      return;
    }

    // optimistic update
    setTaskList((prev) =>
      prev.map((t) => (t.id === draggedId ? { ...t, status: newStatus } : t))
    );

    try {
      await axios.put(`/api/tasks/${draggedId}`, { status: newStatus });
    } catch (error) {
      console.error("Failed to update task:", error);
      // rollback
      setTaskList((prev) =>
        prev.map((t) =>
          t.id === draggedId ? { ...t, status: draggedTask.status } : t
        )
      );
    }

    setActiveTask(null);
  };

  const handleEditSave = (updated: Task) => {
    setTaskList((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleAddTask = (newTask: Task) => {
    setTaskList((prev) => [newTask, ...prev]);
  };

  const handleDelete = async (task: Task) => {
    try {
      await axios.delete(`/api/tasks/${task.id}`);
      setTaskList((prev) => prev.filter((t) => t.id !== task.id));
      setDeleteTask(null);
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  return (
    <div className="font-sans w-full h-full">
      {/* Header */}
      <div className="flex justify-between mb-2 items-center">
        <h1 className="text-lg sm:text-2xl text-heading font-semibold">
          Tasks
        </h1>
        <CreateTaskModal onCreate={handleAddTask} />
      </div>

      {/* Modals */}
      {editTask && (
        <EditTaskModal
          task={editTask}
          onClose={() => setEditTask(null)}
          onSave={handleEditSave}
        />
      )}

      {deleteTask && (
        <DeleteTaskModal
          task={deleteTask}
          onCancel={() => setDeleteTask(null)}
          onConfirm={() => handleDelete(deleteTask)}
        />
      )}

      {/* Toolbar */}
      <div className="flex justify-between mb-4 items-center rounded-lg">
        {/* Icons */}
        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="relative hover:bg-text/25 rounded-sm duration-150 w-8 h-8 flex items-center justify-center">
            <ListFilter
              size={16}
              className="text-gray-600 pointer-events-none"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              <option value="ALL">All</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          {/* Sort */}
          <div className="relative hover:bg-text/25 rounded-sm duration-150 w-8 h-8 flex items-center justify-center">
            <ArrowUpDown
              size={16}
              className="text-gray-600 pointer-events-none"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              <option value="NEW">Newest</option>
              <option value="OLD">Oldest</option>
              <option value="AZ">A → Z</option>
              <option value="ZA">Z → A</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="pl-10 pr-4 w-56 sm:w-64 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
      >
        {/* Responsive Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-all">
          {(Object.keys(columns) as TaskStatus[]).map((status) => (
            <Column key={status} id={status}>
              <h2 className="font-semibold text-lg mb-4 flex justify-between items-center gap-2">
                {columnTitles[status]}
                <span className="text-sm text-text/65  px-2 py-0.5 rounded-full">
                  {columns[status].length}
                </span>
              </h2>

              <SortableContext
                items={columns[status].map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {columns[status].length === 0 && (
                    <p className="text-sm text-gray-400">No tasks</p>
                  )}

                  {columns[status].map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => setEditTask(task)}
                      onDelete={() => setDeleteTask(task)}
                    />
                  ))}
                </div>
              </SortableContext>
            </Column>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="scale-105 shadow-2xl">
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
