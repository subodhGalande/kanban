"use client";

import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const TaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

type TaskForm = z.infer<typeof TaskSchema>;

export default function CreateTaskModal({ onCreate }) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskForm>({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
    },
  });

  const onSubmit = async (data: TaskForm) => {
    try {
      const res = await axios.post("/api/tasks", data);
      console.log(data);
      if (res.status === 201) {
        onCreate(res.data.task);
        reset();
        setOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          reset({
            title: "",
            description: "",
            priority: "MEDIUM",
          });
          setOpen(true);
        }}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Create Task
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[400px] shadow-lg">
            <h2 className="text-xl font-semibold mb-4">New Task</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <input
                  {...register("title")}
                  placeholder="Title"
                  className="border p-2 rounded w-full"
                />
                {errors.title && (
                  <p className="text-red-600 text-sm">{errors.title.message}</p>
                )}
              </div>

              <div>
                <textarea
                  {...register("description")}
                  placeholder="Description"
                  className="border p-2 rounded w-full h-20"
                />
                {errors.description && (
                  <p className="text-red-600 text-sm">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <select
                  {...register("priority")}
                  defaultValue="MEDIUM"
                  className="border p-2 rounded w-full"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
