import { useState, useMemo } from "react";
import Editor from "../Editor";
import InfoBar from "../InfoBar";
import { useWebSocket } from "../hooks/useWebSocket";
import { useWebSocketUrl } from "../hooks/useApi";
import { useBufferedOperation } from "../hooks/useBufferedOperation";

interface Doc {
  title: string;
  type: "public" | "private";
  password?: string;
}

interface EditorViewProps {
  docId: string;
  doc: Doc;
  user: string;
  text: string;
  rev: number;
  onTextChange: (text: string) => void;
  onCopyLink: () => void;
}

export default function EditorView({
  docId,
  doc,
  user,
  text,
  rev,
  onTextChange,
  onCopyLink,
}: EditorViewProps) {
  const [clientId] = useState(() => crypto.randomUUID());
  const { getWebSocketUrl } = useWebSocketUrl();
  
  // Memoize wsUrl to prevent reconnections on re-renders
  const wsUrl = useMemo(() => 
    getWebSocketUrl(docId, clientId), 
    [getWebSocketUrl, docId, clientId]
  );

  const {
    isConnected,
    isConnecting,
    error: wsError,
    sendOperationTransaction,
  } = useWebSocket({
    url: wsUrl,
    onMessage: (message) => {
      console.log('📨 WebSocket message:', message);

      switch (message.type) {
        case 'init':
          // Initial document state from server
          if (message.document) {
            console.log('📄 Document loaded:', message.document);
            onTextChange(message.document.content);
          }
          break;

        case 'operation':
          // Remote operation from another user
          if (message.delta) {
            console.log('✏️ Remote operation:', message.delta);
            // TODO: Apply operation transformation here
            // For now, just log it
          }
          break;

        case 'cursor':
          // Remote cursor update
          if (message.cursor) {
            console.log('👆 Cursor update:', message.cursor);
            // TODO: Display other users' cursors
          }
          break;

        case 'error':
          console.error('❌ Server error:', message.error);
          break;
      }
    },
    onOpen: () => {
      console.log('✅ WebSocket connected to document:', docId);
    },
    onClose: () => {
      console.log('🔴 WebSocket disconnected');
    },
    onError: (error) => {
      console.error('❌ WebSocket error:', error);
    },
  });

  // Use buffered operation hook
  const { handleTextChange } = useBufferedOperation({
    clientId,
    rev,
    isConnected,
    sendOperationTransaction,
    onTextChange,
  });

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
        <div className="font-semibold">{doc.title}</div>
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="text-xs">
            {isConnecting && <span className="text-yellow-300">⏳ Connecting...</span>}
            {isConnected && <span className="text-green-300">🟢 Connected</span>}
            {!isConnecting && !isConnected && <span className="text-red-300">🔴 Disconnected</span>}
            {wsError && <span className="text-red-300">❌ {wsError}</span>}
          </div>
          
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
      <Editor value={text} onChange={handleTextChange} />
    </div>
  );
}

