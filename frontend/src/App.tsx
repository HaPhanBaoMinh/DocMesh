import { useState } from "react";
import UserNameStep from "./components/UserNameStep";
import CreateDocumentStep from "./components/CreateDocumentStep";
import EditorView from "./components/EditorView";

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

	// ========== STEP 3: Editor ==========
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

