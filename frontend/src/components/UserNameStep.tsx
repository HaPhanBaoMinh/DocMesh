interface UserNameStepProps {
  userName: string;
  onUserNameChange: (name: string) => void;
  onContinue: () => void;
}

export default function UserNameStep({
  userName,
  onUserNameChange,
  onContinue,
}: UserNameStepProps) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="p-6 bg-white shadow rounded-xl w-96 space-y-4">
        <h1 className="text-xl font-semibold text-gray-700 text-center">
          Enter your name
        </h1>
        <input
          type="text"
          value={userName}
          onChange={(e) => onUserNameChange(e.target.value)}
          placeholder="Your name"
          className="w-full border rounded p-2"
        />
        <button
          disabled={!userName.trim()}
          onClick={onContinue}
          className="w-full bg-[#444444] text-white py-2 rounded hover:bg-[#222222] disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

