interface CreateDocumentStepProps {
  title: string;
  type: "public" | "private";
  password: string;
  onTitleChange: (title: string) => void;
  onTypeChange: (type: "public" | "private") => void;
  onPasswordChange: (password: string) => void;
  onCreate: () => void;
}

export default function CreateDocumentStep({
  title,
  type,
  password,
  onTitleChange,
  onTypeChange,
  onPasswordChange,
  onCreate,
}: CreateDocumentStepProps) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="p-6 bg-white shadow rounded-xl w-96 space-y-4">
        <h1 className="text-xl font-semibold text-gray-700 text-center">
          Create Document
        </h1>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Document title"
          className="w-full border rounded p-2"
        />

        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={type === "public"}
              onChange={() => onTypeChange("public")}
            />
            <span>Public</span>
          </label>
          {/* 
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={type === "private"}
              onChange={() => onTypeChange("private")}
            />
            <span>Private</span>
          </label>
          */}
        </div>

        {type === "private" && (
          <input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Password"
            className="w-full border rounded p-2"
          />
        )}

        <button
          disabled={!title.trim() || (type === "private" && !password.trim())}
          onClick={onCreate}
          className="w-full bg-[#444444] text-white py-2 rounded hover:bg-[#222222] disabled:opacity-50"
        >
          Create
        </button>
      </div>
    </div>
  );
}

