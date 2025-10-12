// src/views/EditorView.tsx
import { useState, useMemo, useEffect } from "react";
import Editor from "../Editor";
import InfoBar from "../InfoBar";
import { useWebSocket } from "../hooks/useWebSocket";
import { useWebSocketUrl } from "../hooks/useApi";
import { useBufferedOperation } from "../hooks/useBufferedOperation";
import type { Document } from "../model/types";

interface EditorViewProps {
	docId: string;
	doc: Document;
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
	rev: initialRev,
	onTextChange,
	onCopyLink,
}: EditorViewProps) {
	const [clientId] = useState(() => crypto.randomUUID());
	const [rev, setRev] = useState(initialRev);
	const { getWebSocketUrl } = useWebSocketUrl();

	const wsUrl = useMemo(
		() => getWebSocketUrl(docId, clientId),
		[getWebSocketUrl, docId, clientId]
	);

	// Wire up OT buffer (returns handlers we must invoke on WS messages)
	const {
		onRemoteCommit,
		onServerInit,
	} = useBufferedOperation({
		clientId,
		rev,
		setRev,
		isConnected: false,          // will be updated after WS is ready
		sendOperationTransaction: () => { }, // replace once WS is connected
		onTextChange,
	});

	// WebSocket layer
	const {
		isConnected,
		isConnecting,
		error: wsError,
		sendOperationTransaction,
	} = useWebSocket({
		url: wsUrl,
		onMessage: (message: any) => {
			switch (message.type) {
				case "init": {
					if (doc) onServerInit(doc.content, doc.version);
					break;
				}
				case "operation": {
					// DO NOT early-return for own ops. Let OT handle ACK vs remote.
					const fromClientId = message.client?.id;
					const delta = message.delta;
					if (!delta) return;
					onRemoteCommit(fromClientId, delta.version ?? 0, delta.ops);
					break;
				}
				case "error": {
					// no-op; UI already shows wsError from hook
					break;
				}
			}
		},
		onOpen: () => {
			// no-op
		},
		onClose: () => {
			// no-op
		},
		onError: () => {
			// no-op
		},
	});

	// useEffect(() => {
	// 	if (doc.content) {
	// 		onServerInit(doc.content, doc.version);
	// 	}
	// }, [doc.content, doc.version]);

	// Recreate buffered ops hook with live WS sender + connection flag
	const wired = useBufferedOperation({
		clientId,
		rev,
		setRev,
		isConnected,
		sendOperationTransaction,
		onTextChange,
	});

	return (
		<div className="flex flex-col h-screen">
			<header className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
				<div className="font-semibold">{doc.name}</div>
				<div className="flex items-center space-x-4">
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

			<InfoBar
				user={user}
				rev={rev}
				pendingCount={wired.pendingOpsRef.current.length}
				connected={isConnected}
			/>

			<Editor value={text} onChange={wired.handleTextChange} />

			<div className="p-2 border-t bg-gray-50 text-xs flex justify-between">
				<button
					onClick={wired.flushBuffer}
					className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
				>
					Flush buffer
				</button>
				<span>Client: {clientId}</span>
			</div>
		</div>
	);
}

