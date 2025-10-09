import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserNameStep from '../components/UserNameStep';
import CreateDocumentStep from '../components/CreateDocumentStep';
import LoadingScreen from '../components/LoadingScreen';
import { useCreateDocument } from '../hooks/useApi';

export default function HomePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"user" | "create">("user");
  const [userName, setUserName] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"public" | "private">("public");
  const [password, setPassword] = useState("");

  const { createDocument, isLoading, error } = useCreateDocument();

  const handleCreateDoc = async () => {
    try {
      const newDoc = await createDocument({
        name: title,
        content: "",
        type,
        password,
      });

      // Navigate to document page with doc ID
      navigate(`/${newDoc.id}`, {
        state: {
          userName,
          docTitle: title,
          docType: type,
          password,
        },
      });
    } catch (err) {
      console.error("Failed to create document:", err);
    }
  };

  // Loading state
  if (isLoading) {
    return <LoadingScreen message="Creating document..." error={error} />;
  }

  // Step 1: Enter User Name
  if (step === "user") {
    return (
      <UserNameStep
        userName={userName}
        onUserNameChange={setUserName}
        onContinue={() => setStep("create")}
      />
    );
  }

  // Step 2: Create Document
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

