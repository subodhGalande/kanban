"use client";

import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";

const TaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

type TaskForm = z.infer<typeof TaskSchema>;

export default function CreateTaskModal({ onCreate }: any) {
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
      {/* Open modal button */}
      <button
        onClick={() => {
          reset({ title: "", description: "", priority: "MEDIUM" });
          setOpen(true);
        }}
        className="px-3 py-1 font-sans text-sm sm:text-base hover:scale-105 duration-150 font-medium bg-heading justify-center items-center gap-1 rounded-lg flex text-white"
      >
        <Plus className="w-5 h-5" />
        Add task
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center font-sans">
          <div className="bg-white rounded-xl w-[90%] sm:w-[400px] p-4 sm:p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">New Task</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Title */}
              <div>
                <input
                  {...register("title")}
                  placeholder="Title"
                  className="p-2 rounded-lg bg-card-background w-full"
                />
                {errors.title && (
                  <p className="text-danger text-sm">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <textarea
                  {...register("description")}
                  placeholder="Description"
                  className="p-2 rounded-lg bg-card-background w-full h-20"
                />
                {errors.description && (
                  <p className="text-danger text-sm">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Priority */}
              <div>
                <select
                  {...register("priority")}
                  defaultValue="MEDIUM"
                  className="p-2 rounded-lg bg-card-background w-full"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              {/* Footer buttons */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 border border-heading rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3 py-2 bg-heading text-white rounded-lg disabled:opacity-50"
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
