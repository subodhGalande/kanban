"use client";

import { useState } from "react";
import axios from "axios";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskCard from "./taskCard";
import CreateTaskModal from "./createTaskModal";
import Column from "./column";
import { DragOverlay } from "@dnd-kit/core";

type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
}

interface KanbanBoardProps {
  tasks: Task[];
}

export default function KanbanBoard({ tasks }: KanbanBoardProps) {
  const [taskList, setTaskList] = useState(tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

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

  taskList.forEach((t) => columns[t.status].push(t));

  const columnTitles: Record<TaskStatus, string> = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    REVIEW: "Review",
    DONE: "Done",
  };

  const onDragStart = (event) => {
    const id = event.active.id;
    const task = taskList.find((t) => t.id === id);
    setActiveTask(task || null);
  };

  const onDragEnd = async ({ active, over }) => {
    if (!over) return;

    // Ensure dropped on a column, not a card
    if (!["TODO", "IN_PROGRESS", "REVIEW", "DONE"].includes(over.id)) {
      return;
    }

    const draggedId = active.id;
    const newStatus = over.id as TaskStatus;

    setTaskList((prev) =>
      prev.map((t) => (t.id === draggedId ? { ...t, status: newStatus } : t))
    );

    await axios.put(`/api/tasks/${draggedId}`, { status: newStatus });
  };

  const handleAddTask = (newTask: Task) => {
    setTaskList((prev) => [newTask, ...prev]);
  };

  return (
    <div className="space-y-6">
      <CreateTaskModal onCreate={handleAddTask} />

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
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </SortableContext>
            </Column>
          ))}
        </div>
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
