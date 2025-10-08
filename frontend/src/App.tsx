import { useState } from "react";
import UserNameStep from "./components/UserNameStep";
import CreateDocumentStep from "./components/CreateDocumentStep";
import EditorView from "./components/EditorView";
import { useCreateDocument } from "./hooks/useApi";

interface Doc {
	title: string;
	type: "public" | "private";
	password?: string;
	id?: string;
}

export default function App() {
	const [step, setStep] = useState<"user" | "create" | "editor">("user");
	const [user, setUser] = useState("");
	const [doc, setDoc] = useState<Doc | null>(null);
	const [text, setText] = useState("");
	const [rev, setRev] = useState(0);
	const { createDocument, isLoading, error, data, reset } = useCreateDocument();

	const [title, setTitle] = useState("");
	const [type, setType] = useState<"public" | "private">("public");
	const [password, setPassword] = useState("");

	async function handleCreateDoc() {
		// reset();
		try {
			const response = await createDocument({
				name: title,
				content: "",
				type,
				password,
			});
			setText(response.content);
			setRev(response.version);
			setDoc({ title, type, password, id: data?.id });
		} catch (error) {
			console.error("Failed to create document. Please try again.");
		} finally {
			// reset();
		}
		setStep("editor");
	}

	function handleCopyLink() {
		if (!doc) return;
		if (!doc.id) return;
		const link = `${window.location.origin}/docs/${encodeURIComponent(doc.id)}`;
		navigator.clipboard.writeText(link);
		alert("Link copied!");
	}

	// ========== STEP 1: Enter User Name ==========
	if (step === "user") {
		return (
			<UserNameStep
				userName={user}
				onUserNameChange={setUser}
				onContinue={() => setStep("create")}
			/>
		);
	}

	// ========== STEP 2: Create Document ==========
	if (step === "create") {
		return (
			<CreateDocumentStep
				title={title}
				type={type}
				password={password}
				onTitleChange={setTitle}
				onTypeChange={setType}
				onPasswordChange={setPassword}
				onCreate={handleCreateDoc}
			/>
		);
	}

	// ========== STEP 3: Loading ==========
	if (isLoading) {
		return (
			<div>
				<h1>Loading...</h1>
				<p>{error}</p>
			</div>
		);
	}

	// ========== STEP 4: Editor ==========
	if (step === "editor" && doc) {
		return (
			<EditorView
				doc={doc}
				user={user}
				text={text}
				rev={rev}
				onTextChange={setText}
				onCopyLink={handleCopyLink}
			/>
		);
	}

	return null;
}

