"use client";

export default function DeleteTaskModal({ task, onConfirm, onCancel }: any) {
  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center font-sans">
      <div className="bg-white rounded-xl w-[90%] sm:w-[400px] p-4 sm:p-6 shadow-lg space-y-4">
        <h2 className="text-xl font-semibold">Delete Task?</h2>

        <p className="text-sm text-gray-600">
          Are you sure you want to delete <b>{task.title}</b>?
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-2 border border-heading rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-danger transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
