import { useState } from "react";
import Editor from "./Editor";
import InfoBar from "./InfoBar";

interface Doc {
	title: string;
	type: "public" | "private";
	password?: string;
}

export default function App() {
	const [step, setStep] = useState<"user" | "create" | "editor">("user");
	const [user, setUser] = useState("");
	const [doc, setDoc] = useState<Doc | null>(null);
	const [text, setText] = useState("");
	const [rev, setRev] = useState(0);

	// State dùng cho màn "create"
	const [title, setTitle] = useState("");
	const [type, setType] = useState<"public" | "private">("public");
	const [password, setPassword] = useState("");

	function handleCreateDoc() {
		setDoc({ title, type, password });
		setStep("editor");
	}

	function handleCopyLink() {
		if (!doc) return;
		const link = `${window.location.origin}/docs/${encodeURIComponent(doc.title)}`;
		navigator.clipboard.writeText(link);
		alert("Link copied!");
	}

	// ========== STEP 1 ==========
	if (step === "user") {
		return (
			<div className="flex items-center justify-center h-screen bg-gray-50">
				<div className="p-6 bg-white shadow rounded-xl w-96 space-y-4">
					<h1 className="text-xl font-semibold text-gray-700 text-center">
						Enter your name
					</h1>
					<input
						type="text"
						value={user}
						onChange={(e) => setUser(e.target.value)}
						placeholder="Your name"
						className="w-full border rounded p-2"
					/>
					<button
						disabled={!user.trim()}
						onClick={() => setStep("create")}
						className="w-full bg-[#444444] text-white py-2 rounded hover:bg-[#222222] disabled:opacity-50"
					>
						Continue
					</button>
				</div>
			</div>
		);
	}

	// ========== STEP 2 ==========
	if (step === "create") {
		return (
			<div className="flex items-center justify-center h-screen bg-gray-50">
				<div className="p-6 bg-white shadow rounded-xl w-96 space-y-4">
					<h1 className="text-xl font-semibold text-gray-700 text-center">
						Create Document
					</h1>
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Document title"
						className="w-full border rounded p-2"
					/>

					<div className="flex space-x-4">
						<label className="flex items-center space-x-2">
							<input
								type="radio"
								checked={type === "public"}
								onChange={() => setType("public")}
							/>
							<span>Public</span>
						</label>
						{
							/* 
						<label className="flex items-center space-x-2">
							<input
								type="radio"
								checked={type === "private"}
								onChange={() => setType("private")}
							/>
							<span>Private</span>
						</label>
						*/
						}
					</div>

					{type === "private" && (
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Password"
							className="w-full border rounded p-2"
						/>
					)}

					<button
						disabled={!title.trim() || (type === "private" && !password.trim())}
						onClick={handleCreateDoc}
						className="w-full bg-[#444444] text-white py-2 rounded hover:bg-[#222222] disabled:opacity-50"

					>
						Create
					</button>
				</div>
			</div>
		);
	}

	// ========== STEP 3 ==========
	if (step === "editor" && doc) {
		return (
			<div className="flex flex-col h-screen">
				<header className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
					<div className="font-semibold">{doc.title}</div>
					<div className="flex items-center space-x-4">
						<button
							onClick={handleCopyLink}
							className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
						>
							Get Link
						</button>
						<div className="text-sm text-gray-200">👤 {user}</div>
					</div>
				</header>

				<InfoBar user={user} rev={rev} />
				<Editor value={text} onChange={setText} />
			</div>
		);
	}

	return null;
}

