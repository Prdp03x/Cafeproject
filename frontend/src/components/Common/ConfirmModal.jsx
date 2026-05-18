const ConfirmModal = ({
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  danger = false,
}) => {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">

      <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl p-6 animate-in fade-in zoom-in-95 duration-200">

        {/* ICON */}
        <div
          className={`h-16 w-16 mx-auto rounded-full flex items-center justify-center text-3xl ${
            danger
              ? "bg-red-50 text-red-600"
              : "bg-gray-100"
          }`}
        >
          {danger ? "🗑️" : "⚠️"}
        </div>

        {/* TITLE */}
        <h2 className="text-xl font-bold text-center mt-5">
          {title}
        </h2>

        {/* MESSAGE */}
        <p className="text-gray-500 text-center mt-2 leading-relaxed">
          {message}
        </p>

        {/* ACTIONS */}
        <div className="flex gap-3 mt-6">

          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border py-3 rounded-2xl hover:bg-gray-50 transition"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 text-white py-3 rounded-2xl transition ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "theme-primary theme-primary-hover"
            }`}
          >
            {loading
              ? "Please wait..."
              : confirmText}
          </button>

        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;
