import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import EditorView from '../components/EditorView';
import UserNameModal from '../components/UserNameModal';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import { useGetDocument } from '../hooks/useApi';

interface LocationState {
	userName?: string;
	docTitle?: string;
	docType?: "public" | "private";
	password?: string;
}

export default function DocumentPage() {
	const { docId } = useParams<{ docId: string }>();
	const location = useLocation();
	const navigate = useNavigate();

	const state = location.state as LocationState;

	// Fetch document from server
	const { document, isLoading: isLoadingDoc, error: docError } = useGetDocument(docId || '');

	// Get data from location state or from fetched document
	const [user, setUser] = useState<string | null>(state?.userName || null);
	const [docTitle, setDocTitle] = useState(state?.docTitle || "");
	const [text, setText] = useState("");
	const [rev, setRev] = useState(0);
	const [showNameModal, setShowNameModal] = useState(false);

	// Update doc title when document is fetched
	useEffect(() => {
		if (document && !docTitle) {
			setDocTitle(document.name || "Untitled Document");
		}
	}, [document, docTitle]);

	const doc = {
		title: docTitle || "Untitled Document",
		type: state?.docType || "public" as const,
		password: state?.password,
	};

	const handleCopyLink = () => {
		if (!docId) return;
		const link = `${window.location.origin}/${docId}`;
		navigator.clipboard.writeText(link);
		alert("Link copied!");
	};

	const handleUserNameSubmit = (name: string) => {
		setUser(name);
		setShowNameModal(false);
	};

	// Check if user needs to enter name
	useEffect(() => {
		if (!user) {
			setShowNameModal(true);
		}
	}, [user]);

	// Redirect to home if no docId
	useEffect(() => {
		if (!docId) {
			navigate('/');
		}
	}, [docId, navigate]);

	if (!docId) {
		return null;
	}

	// Show loading while fetching document
	if (isLoadingDoc) {
		return <LoadingScreen message="Loading document..." />;
	}

	// Show error if failed to fetch or document not found (404)
	if (docError) {
		// Auto redirect to home after 3 seconds for 404 errors
		if (docError.includes('404') || docError.includes('not found')) {
			setTimeout(() => {
				navigate('/');
			}, 3000);
		}

		return (
			<ErrorScreen
				title="Document Not Found"
				message={docError.includes('404') || docError.includes('not found')
					? 'This document does not exist. Redirecting to home...'
					: docError
				}
				onAction={() => navigate('/')}
				actionLabel="Go Home Now"
			/>
		);
	}

	// Show modal if no user name
	if (showNameModal || !user) {
		return <UserNameModal onSubmit={handleUserNameSubmit} />;
	}

	return (
		<EditorView
			docId={docId}
			doc={doc}
			user={user}
			text={text}
			rev={rev}
			onTextChange={setText}
			onCopyLink={handleCopyLink}
		/>
	);
}

