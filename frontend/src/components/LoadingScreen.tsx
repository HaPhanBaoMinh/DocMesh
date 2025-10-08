interface LoadingScreenProps {
  message?: string;
  error?: string | null;
}

export default function LoadingScreen({ 
  message = "Loading...", 
  error 
}: LoadingScreenProps) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="p-6 bg-white shadow rounded-xl w-96 space-y-4">
        <h1 className="text-xl font-semibold text-gray-700 text-center">
          {message}
        </h1>
        {error && (
          <p className="text-red-500 text-center text-sm">{error}</p>
        )}
        
        {/* Optional: Add spinner animation */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
        </div>
      </div>
    </div>
  );
}

