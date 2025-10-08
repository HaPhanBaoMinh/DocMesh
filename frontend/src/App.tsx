import { useState } from "react";
import Editor from "./Editor";
import InfoBar from "./InfoBar";
import { apiService } from "./services/api";

interface Doc {
	id: string;
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
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// State for "create" screen
	const [title, setTitle] = useState("");
	const [type, setType] = useState<"public" | "private">("public");
	const [password, setPassword] = useState("");

	async function handleCreateDoc() {
		setLoading(true);
		setError(null);

		try {
			// Call backend API to create document
			const response = await apiService.createDocument({
				name: title,
				content: "",
			});

			console.log("Document created:", response);

			// Set document state with response from backend
			setDoc({
				id: response.id,
				title: response.name,
				type,
				password,
			});
			
			setText(response.content);
			setRev(response.version);
			setStep("editor");
		} catch (err) {
			console.error("Failed to create document:", err);
			setError("Failed to create document. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	function handleCopyLink() {
		if (!doc) return;
		const link = `${window.location.origin}/docs/${doc.id}`;
		navigator.clipboard.writeText(link);
		alert("Link copied!");
	}

	// ========== STEP 1: Enter Name ==========
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
						className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
						onKeyDown={(e) => e.key === "Enter" && user.trim() && setStep("create")}
					/>
					<button
						disabled={!user.trim()}
						onClick={() => setStep("create")}
						className="w-full bg-[#444444] text-white py-2 rounded hover:bg-[#222222] disabled:opacity-50 transition-colors"
					>
						Continue
					</button>
				</div>
			</div>
		);
	}

	// ========== STEP 2: Create Document ==========
	if (step === "create") {
		return (
			<div className="flex items-center justify-center h-screen bg-gray-50">
				<div className="p-6 bg-white shadow rounded-xl w-96 space-y-4">
					<h1 className="text-xl font-semibold text-gray-700 text-center">
						Create Document
					</h1>
					
					{error && (
						<div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
							{error}
						</div>
					)}

					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Document title"
						className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
						disabled={loading}
					/>

					<div className="flex space-x-4">
						<label className="flex items-center space-x-2 cursor-pointer">
							<input
								type="radio"
								checked={type === "public"}
								onChange={() => setType("public")}
								disabled={loading}
								className="cursor-pointer"
							/>
							<span>Public</span>
						</label>
						{/* Private option commented out for now */}
						{/* 
						<label className="flex items-center space-x-2 cursor-pointer">
							<input
								type="radio"
								checked={type === "private"}
								onChange={() => setType("private")}
								disabled={loading}
								className="cursor-pointer"
							/>
							<span>Private</span>
						</label>
						*/}
					</div>

					{type === "private" && (
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Password"
							className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
							disabled={loading}
						/>
					)}

					<button
						disabled={!title.trim() || (type === "private" && !password.trim()) || loading}
						onClick={handleCreateDoc}
						className="w-full bg-[#444444] text-white py-2 rounded hover:bg-[#222222] disabled:opacity-50 transition-colors flex items-center justify-center"
					>
						{loading ? (
							<>
								<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Creating...
							</>
						) : (
							"Create"
						)}
					</button>

					<button
						onClick={() => setStep("user")}
						className="w-full text-gray-600 py-2 text-sm hover:text-gray-800"
						disabled={loading}
					>
						← Back
					</button>
				</div>
			</div>
		);
	}

	// ========== STEP 3: Editor ==========
	if (step === "editor" && doc) {
		return (
			<div className="flex flex-col h-screen">
				<header className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
					<div className="font-semibold">{doc.title}</div>
					<div className="flex items-center space-x-4">
						<button
							onClick={handleCopyLink}
							className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 transition-colors"
						>
							📋 Get Link
						</button>
						<div className="text-sm text-gray-200">👤 {user}</div>
					</div>
				</header>

				<InfoBar user={user} rev={rev} />
				<Editor 
					docId={doc.id}
					userName={user}
					value={text} 
					onChange={setText}
					onVersionChange={setRev}
				/>
			</div>
		);
	}

	return null;
}