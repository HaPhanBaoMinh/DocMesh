import { useRef, useEffect } from "react";
import type { Delta } from "../model/types";
import { calculateOperations } from "../utils/textDiff";

const TYPING_TIMEOUT = 800;        // 800ms sau khi dừng gõ thì gửi
const MAX_WAIT_TIME = 1000;       // 1s: Thời gian tối đa chờ khi user gõ liên tục
const SEND_INTERVAL = 1000;        // gửi định kỳ mỗi 1s

export function useBufferedOperation({
  clientId,
  rev,
  isConnected,
  sendOperationTransaction,
  onTextChange,
}: {
  clientId: string;
  rev: number;
  isConnected: boolean;
  sendOperationTransaction: (delta: Delta) => void;
  onTextChange: (text: string) => void;
}) {
  const currentTextRef = useRef<string>("");     // Current text state
  const lastSentTextRef = useRef<string>("");    // Last text sent to server
  const timeoutRef = useRef<number | null>(null);
  const firstChangeTimeRef = useRef<number | null>(null); // Thời điểm thay đổi đầu tiên

  // interval gửi định kỳ
  useEffect(() => {
    const interval = setInterval(() => {
      flushBuffer();
    }, SEND_INTERVAL);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function flushBuffer() {
    if (!isConnected) return;
    
    const oldText = lastSentTextRef.current;
    const newText = currentTextRef.current;
    
    // No changes to send
    if (oldText === newText) return;

    // Calculate diff operations
    const ops = calculateOperations(oldText, newText);
    
    // No operations (shouldn't happen, but just in case)
    if (ops.length === 0) return;

    console.log('📤 Sending operations:', ops);
    console.log('   Old text:', oldText);
    console.log('   New text:', newText);

    const delta: Delta = {
      client_id: clientId,
      version: rev,
      ops: ops,
      timestamp: Date.now(),
    };
    
    sendOperationTransaction(delta);
    
    // Update last sent text và reset first change time
    lastSentTextRef.current = newText;
    firstChangeTimeRef.current = null; // Reset thời điểm bắt đầu
  }

  function handleTextChange(newText: string, event?: KeyboardEvent) {
    // Update local state
    onTextChange(newText);
    currentTextRef.current = newText;

    // Track thời điểm thay đổi đầu tiên
    const now = Date.now();
    if (firstChangeTimeRef.current === null) {
      firstChangeTimeRef.current = now;
    }

    // Kiểm tra xem đã quá MAX_WAIT_TIME chưa
    const timeSinceFirstChange = now - firstChangeTimeRef.current;
    if (timeSinceFirstChange >= MAX_WAIT_TIME) {
      console.log('⚠️ Force flush: User gõ quá lâu (>10s)');
      flushBuffer();
      return;
    }

    // Nếu là Enter hoặc Delete → gửi ngay
    if (event && (event.key === "Enter" || event.key === "Delete" || event.key === "Backspace")) {
      flushBuffer();
      return;
    }

    // Reset timer khi user gõ liên tục
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      flushBuffer();
    }, TYPING_TIMEOUT);
  }

  return { handleTextChange, flushBuffer };
}

