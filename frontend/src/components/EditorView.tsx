import Editor from "../Editor";
import InfoBar from "../InfoBar";

interface Doc {
  title: string;
  type: "public" | "private";
  password?: string;
}

interface EditorViewProps {
  doc: Doc;
  user: string;
  text: string;
  rev: number;
  onTextChange: (text: string) => void;
  onCopyLink: () => void;
}

export default function EditorView({
  doc,
  user,
  text,
  rev,
  onTextChange,
  onCopyLink,
}: EditorViewProps) {
  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
        <div className="font-semibold">{doc.title}</div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onCopyLink}
            className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
          >
            Get Link
          </button>
          <div className="text-sm text-gray-200">👤 {user}</div>
        </div>
      </header>

      <InfoBar user={user} rev={rev} />
      <Editor value={text} onChange={onTextChange} />
    </div>
  );
}

