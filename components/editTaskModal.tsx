"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const EditSchema = z.object({
  title: z.string().min(1, "Title required"),
  description: z.string().min(1, "Description required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

type EditForm = z.infer<typeof EditSchema>;

export default function EditTaskModal({ task, onClose, onSave }: any) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditForm>({
    resolver: zodResolver(EditSchema),
  });

  // Load existing values
  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        priority: task.priority,
      });
    }
  }, [task, reset]);

  const onSubmit = async (data: EditForm) => {
    try {
      const res = await axios.put(`/api/tasks/${task.id}`, data);
      onSave(res.data.task);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center font-sans">
      <div className="bg-white rounded-xl w-[90%] sm:w-[400px] p-4 sm:p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Edit Task</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div>
            <select
              {...register("priority")}
              className="p-2 rounded-lg bg-card-background w-full"
              defaultValue={task.priority}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border border-heading rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-2 bg-heading text-white rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
