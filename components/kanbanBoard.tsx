"use client";

import { useState } from "react";
import axios from "axios";
import {
  DndContext,
  closestCenter,
  PointerSensor,
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
      if (sortBy === "NEW") return 0; // newest already first
      if (sortBy === "OLD") return 0; // optional future improvement

      if (sortBy === "AZ") return a.title.localeCompare(b.title);
      if (sortBy === "ZA") return b.title.localeCompare(a.title);

      return 0;
    });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
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

    setTaskList((prev) =>
      prev.map((t) => (t.id === draggedId ? { ...t, status: newStatus } : t))
    );

    console.log("Sending status:", newStatus);

    try {
      await axios.put(`/api/tasks/${draggedId}`, { status: newStatus });
    } catch (error) {
      console.error("Failed to update task:", error);
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
    <div className="space-y-6">
      <CreateTaskModal onCreate={handleAddTask} />

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

      {/* Search / Filter / Sort Bar */}
      <div className="flex items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="border p-2 rounded w-64"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="border p-2 rounded"
        >
          <option value="ALL">All</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="REVIEW">Review</option>
          <option value="DONE">Done</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="border p-2 rounded"
        >
          <option value="NEW">Newest</option>
          <option value="OLD">Oldest</option>
          <option value="AZ">A → Z</option>
          <option value="ZA">Z → A</option>
        </select>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
      >
        <div className="grid grid-cols-4 gap-4">
          {(Object.keys(columns) as TaskStatus[]).map((status) => (
            <Column key={status} id={status}>
              <h2 className="font-semibold text-lg mb-4">
                {columnTitles[status]}
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
            <TaskCard onDelete={() => {}} onEdit={() => {}} task={activeTask} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
