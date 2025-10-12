// src/hooks/useBufferedOperation.ts
import { useEffect, useRef } from "react";
import type { Delta, Operation } from "../model/types";
import { calculateOperations, applyOperations } from "../utils/textDiff";
import { transformOps } from "../utils/ot";

const TYPING_TIMEOUT = 800;       // 0.8s sau khi dừng gõ thì gửi
const MAX_WAIT_TIME = 1000;       // 1s: nếu gõ liên tục thì auto gửi
const SEND_INTERVAL = 1000;       // gửi định kỳ mỗi 1s

export function useBufferedOperation({
	clientId,
	rev,
	setRev,
	isConnected,
	sendOperationTransaction,
	onTextChange,
}: {
	clientId: string;
	rev: number;
	setRev: (newRev: number) => void;
	isConnected: boolean;
	sendOperationTransaction: (delta: Delta) => void;
	onTextChange: (text: string) => void;
}) {
	/** -------------------- Refs -------------------- **/
	const revRef = useRef(rev);
	const currentTextRef = useRef<string>("");          // current local text
	const serverBaseTextRef = useRef<string>("");       // last confirmed base from server
	const pendingOpsRef = useRef<Delta[]>([]);          // pending unacked ops
	const timeoutRef = useRef<number | null>(null);
	const firstChangeTimeRef = useRef<number | null>(null);

	// keep revRef in sync with latest rev
	useEffect(() => {
		revRef.current = rev;
	}, [rev]);

	// flush buffer every SEND_INTERVAL
	useEffect(() => {
		const interval = setInterval(() => flushBuffer(), SEND_INTERVAL);
		return () => clearInterval(interval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isConnected]);

	/** -------------------- Utils -------------------- **/
	function localSetText(newText: string) {
		currentTextRef.current = newText;
		onTextChange(newText);
	}

	function applyPending(baseText: string, deltas: Delta[]): string {
		let t = baseText;
		for (const d of deltas) t = applyOperations(t, d.ops);
		return t;
	}

	/** -------------------- Flush Buffer -------------------- **/
	function flushBuffer() {
		if (!isConnected) return;

		const currentRev = revRef.current;
		const base = serverBaseTextRef.current;
		const local = currentTextRef.current;

		const ops = calculateOperations(applyPending(base, pendingOpsRef.current), local);
		if (ops.length === 0) return;

		const delta: Delta = {
			client_id: clientId,
			version: currentRev,          // use current
			ops,
			timestamp: Date.now(),
		};

		sendOperationTransaction(delta);
		pendingOpsRef.current.push(delta);

		// optimistic bump – so next flush uses rev+1 immediately
		revRef.current = currentRev + 1;
		setRev(currentRev + 1);

		console.log("📝 Sending delta:", delta);
		firstChangeTimeRef.current = null;
	}

	/** -------------------- Handle local text change -------------------- **/
	function handleTextChange(newText: string, event?: KeyboardEvent) {
		localSetText(newText);
		const now = Date.now();
		if (firstChangeTimeRef.current === null) firstChangeTimeRef.current = now;

		const elapsed = now - firstChangeTimeRef.current;
		if (elapsed >= MAX_WAIT_TIME) {
			flushBuffer();
			return;
		}

		if (event && (event.key === "Enter" || event.key === "Delete" || event.key === "Backspace")) {
			flushBuffer();
			return;
		}

		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => flushBuffer(), TYPING_TIMEOUT);
	}

	/** -------------------- Handle Remote Commit -------------------- **/
	function onRemoteCommit(clientIdFromServer: string | undefined, version: number, ops: Operation[]) {
		const currentRev = revRef.current;

		// Bỏ qua commit cũ
		if (version <= currentRev) return;

		// === CASE 1: ACK (commit thuộc chính mình) ===
		if (clientIdFromServer === clientId) {
			if (pendingOpsRef.current.length > 0) pendingOpsRef.current.shift();

			// Cập nhật base text theo server
			serverBaseTextRef.current = applyOperations(serverBaseTextRef.current, ops);

			// Reapply pending nếu còn
			if (pendingOpsRef.current.length > 0) {
				const rebased = applyPending(serverBaseTextRef.current, pendingOpsRef.current);
				localSetText(rebased);
			} else {
				localSetText(serverBaseTextRef.current);
			}

			setRev(version);
			revRef.current = version; // ✅ cập nhật ngay
			console.log(`✅ ACK from self → rev=${version}`);
			return;
		}

		// === CASE 2: Commit từ người khác ===
		if (version !== currentRev + 1) {
			console.warn(`⚠️ Version gap: expected ${currentRev + 1}, got ${version}`);
			return;
		}

		// Apply remote delta vào base
		serverBaseTextRef.current = applyOperations(serverBaseTextRef.current, ops);

		// Transform pending theo delta mới
		pendingOpsRef.current = pendingOpsRef.current.map((d) => ({
			...d,
			ops: transformOps(d.ops, ops),
		}));

		// Reapply pending để khôi phục local view
		const recomputed = applyPending(serverBaseTextRef.current, pendingOpsRef.current);
		localSetText(recomputed);

		setRev(version);
		revRef.current = version;
		console.log(`✅ Applied remote commit rev=${version}`);
	}

	/** -------------------- Handle Server Init -------------------- **/
	function onServerInit(content: string, version: number) {
		serverBaseTextRef.current = content;
		currentTextRef.current = content;
		onTextChange(content);
		setRev(version);
		revRef.current = version;
		console.log(`📄 Document init version=${version}`);
	}

	/** -------------------- Exports -------------------- **/
	return {
		handleTextChange,
		flushBuffer,
		onRemoteCommit,
		onServerInit,
		pendingOpsRef,
	};
}

