"use client";

export default function DeleteTaskModal({ task, onConfirm, onCancel }: any) {
  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex z-[9999] items-center justify-center">
      <div className="bg-white p-6 rounded w-[350px] shadow-lg space-y-4">
        <h2 className="text-lg font-semibold">Delete Task?</h2>
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <b>{task.title}</b>?
        </p>

        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-2 border rounded">
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-3 py-2 bg-red-600 text-white rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
