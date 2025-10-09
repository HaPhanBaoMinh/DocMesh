interface ErrorScreenProps {
  title?: string;
  message: string;
  onAction?: () => void;
  actionLabel?: string;
}

export default function ErrorScreen({
  title = "Error",
  message,
  onAction,
  actionLabel = "Go Home",
}: ErrorScreenProps) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="p-6 bg-white shadow rounded-xl w-96 text-center space-y-4">
        <h1 className="text-xl font-semibold text-red-600">
          {title}
        </h1>
        <p className="text-gray-700">
          {message}
        </p>
        {onAction && (
          <button
            onClick={onAction}
            className="w-full px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

