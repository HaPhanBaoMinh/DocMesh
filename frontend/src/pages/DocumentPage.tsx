import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import EditorView from '../components/EditorView';

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
  
  // Get data from location state or use defaults
  const [user] = useState(state?.userName || "Anonymous");
  const [docTitle] = useState(state?.docTitle || "Untitled Document");
  const [text, setText] = useState("");
  const [rev, setRev] = useState(0);

  const doc = {
    title: docTitle,
    type: state?.docType || "public" as const,
    password: state?.password,
  };

  const handleCopyLink = () => {
    if (!docId) return;
    const link = `${window.location.origin}/${docId}`;
    navigator.clipboard.writeText(link);
    alert("Link copied!");
  };

  // Redirect to home if no docId
  useEffect(() => {
    if (!docId) {
      navigate('/');
    }
  }, [docId, navigate]);

  if (!docId) {
    return null;
  }

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

