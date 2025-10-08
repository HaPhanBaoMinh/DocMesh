# 🔌 API Integration Guide

This guide explains how the frontend communicates with the backend API.

---

## 📁 File Structure

```
src/
├── services/
│   └── api.ts              # API service for HTTP calls
├── hooks/
│   └── useWebSocket.ts     # Custom hook for WebSocket
├── utils/
│   └── generateId.ts       # UUID generation utility
├── App.tsx                 # Updated with API integration
└── Editor.tsx              # Updated with WebSocket integration
```

---

## 🚀 Quick Setup

### 1. Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8080
```

This configures the backend API URL for your frontend.

### 2. Install & Run

```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API Service (`services/api.ts`)

### Features
- ✅ Create documents via HTTP POST
- ✅ Generate WebSocket URLs
- ✅ Health check endpoint
- ✅ Type-safe with TypeScript

### Usage Example

```typescript
import { apiService } from './services/api';

// Create a document
const doc = await apiService.createDocument({
  name: "My Document",
  content: "Initial content"
});

// Get WebSocket URL
const wsUrl = apiService.getWebSocketUrl(
  docId,
  clientId,
  clientName
);
```

### API Methods

#### `createDocument(data)`
Creates a new document on the server.

**Request:**
```typescript
{
  name: string;
  content?: string;
}
```

**Response:**
```typescript
{
  id: string;
  name: string;
  content: string;
  version: number;
}
```

#### `getWebSocketUrl(docId, clientId, clientName)`
Generates WebSocket URL for real-time collaboration.

**Returns:** `string`

Example: `ws://localhost:8080/ws?docId=xxx&clientId=yyy&clientName=Alice`

#### `healthCheck()`
Checks if backend is available.

**Returns:** `Promise<boolean>`

---

## 🔌 WebSocket Hook (`hooks/useWebSocket.ts`)

### Features
- ✅ Auto-connect on mount
- ✅ Auto-reconnect on disconnect
- ✅ Type-safe message handling
- ✅ Easy-to-use API

### Usage Example

```typescript
import { useWebSocket } from './hooks/useWebSocket';

const {
  sendOperation,
  sendCursor,
  isConnected,
  error
} = useWebSocket({
  url: wsUrl,
  onMessage: (msg) => {
    console.log('Received:', msg);
  },
  autoReconnect: true,
  maxReconnectAttempts: 5
});

// Send operation
sendOperation(delta, cursor);

// Send cursor update
sendCursor(cursor);
```

### Hook Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | required | WebSocket URL |
| `onMessage` | `(msg) => void` | optional | Message handler |
| `onOpen` | `() => void` | optional | Connection opened |
| `onClose` | `() => void` | optional | Connection closed |
| `onError` | `(err) => void` | optional | Error handler |
| `autoReconnect` | `boolean` | `true` | Auto-reconnect |
| `reconnectInterval` | `number` | `3000` | Reconnect delay (ms) |
| `maxReconnectAttempts` | `number` | `5` | Max reconnect tries |

### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `sendMessage` | `(msg: any) => void` | Send raw message |
| `sendOperation` | `(delta, cursor?) => void` | Send operation |
| `sendCursor` | `(cursor) => void` | Send cursor update |
| `isConnected` | `boolean` | Connection status |
| `isConnecting` | `boolean` | Connecting status |
| `error` | `string \| null` | Error message |
| `reconnectAttempts` | `number` | Reconnect count |
| `disconnect` | `() => void` | Manual disconnect |

---

## 📝 Updated Components

### App.tsx

**Changes:**
1. ✅ Imports `apiService`
2. ✅ Calls `createDocument()` API on form submit
3. ✅ Handles loading and error states
4. ✅ Passes `docId` to `Editor`
5. ✅ Shows loading spinner during API call

**Flow:**
```
User enters name 
  → User creates document 
  → API call to /create 
  → Receive document ID 
  → Navigate to editor with docId
```

### Editor.tsx

**Changes:**
1. ✅ Accepts `docId` and `userName` props
2. ✅ Generates unique `clientId` with UUID
3. ✅ Connects to WebSocket via `useWebSocket` hook
4. ✅ Sends operations on text change
5. ✅ Applies remote operations from other users
6. ✅ Tracks and displays other users' cursors
7. ✅ Shows connection status indicator

**Flow:**
```
Editor mounts 
  → Connect WebSocket 
  → Receive initial state 
  → User types 
  → Generate operations 
  → Send to server 
  → Broadcast to others
```

---

## 🔄 Message Flow

### 1. Document Creation (HTTP)

```
Frontend                Backend
   |                      |
   |--- POST /create ---->|
   |    {name: "Doc"}     |
   |                      |
   |<---- 200 OK ---------|
   |    {id, name, ...}   |
   |                      |
```

### 2. Real-time Collaboration (WebSocket)

```
Client A          Server          Client B
   |                |                |
   |-- connect ---->|                |
   |<--- init ------|                |
   |                |<-- connect ----|
   |                |---- init ----->|
   |                |                |
   |-- operation -->|                |
   |                |-- broadcast -->|
   |                |                |
   |<-- operation --|<-- operation --|
   |                |                |
```

### 3. Cursor Tracking

```
Client A          Server          Client B
   |                |                |
   |-- cursor ----->|                |
   |   {pos: 10}    |                |
   |                |-- broadcast -->|
   |                |   {pos: 10}    |
   |                |                |
```

---

## 🎨 UI Enhancements

### Connection Status Indicator

The editor shows real-time connection status:

- 🟡 **Yellow dot**: Connecting...
- 🟢 **Green dot**: Connected
- 🔴 **Red dot**: Error (shows error message)

### Active Users Display

When other users are online:
```
👥 2 others online
Active users: Alice, Bob
```

### Loading States

- ✅ Spinner during document creation
- ✅ Disabled textarea when disconnected
- ✅ Error messages with red background

---

## 🧪 Testing the Integration

### 1. Start Backend
```bash
cd backend
go run main.go
# Output: listening on :8080
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
# Output: Local: http://localhost:5173/
```

### 3. Test Document Creation

1. Open `http://localhost:5173`
2. Enter your name (e.g., "Alice")
3. Click "Continue"
4. Enter document title (e.g., "Test Doc")
5. Click "Create"
6. Should see editor with connection status

**Check Browser Console:**
```
WebSocket connected
Received message: {type: "init", document: {...}}
```

### 4. Test Real-time Collaboration

1. Open another browser window
2. Repeat steps 1-2
3. Click "Create" (creates new doc)
4. In first window, copy the link and open in second window
5. Type in one window
6. See changes appear in the other window

---

## 🐛 Troubleshooting

### Problem: "WebSocket connection failed"

**Solution:**
1. Ensure backend is running on port 8080
2. Check `.env` file has correct URL
3. Check browser console for CORS errors

### Problem: "Failed to create document"

**Solution:**
1. Check backend logs for errors
2. Verify `/create` endpoint is working:
   ```bash
   curl -X POST http://localhost:8080/create \
     -H "Content-Type: application/json" \
     -d '{"name": "Test"}'
   ```
3. Check network tab in browser DevTools

### Problem: Changes not syncing

**Solution:**
1. Check WebSocket connection status (green dot)
2. Verify document IDs match
3. Check browser console for errors
4. Test with `wscat` or similar tool

---

## 🔐 Environment Configuration

### Development
```env
VITE_API_URL=http://localhost:8080
```

### Production
```env
VITE_API_URL=https://api.yourdomain.com
```

---

## 📚 Type Definitions

### Document
```typescript
interface Document {
  id: string;
  name: string;
  content: string;
  version: number;
}
```

### Operation
```typescript
interface Operation {
  type: 'insert' | 'delete' | 'retain';
  pos: number;
  length?: number;
  text?: string;
}
```

### Delta
```typescript
interface Delta {
  client_id: string;
  version: number;
  ops: Operation[];
  timestamp: number;
}
```

### Cursor
```typescript
interface Cursor {
  client_id: string;
  position: number;
  name: string;
}
```

### WebSocket Message
```typescript
interface WSMessage {
  type: 'init' | 'operation' | 'cursor' | 'error';
  document?: Document;
  delta?: Delta;
  cursor?: Cursor;
  clients?: Cursor[];
  error?: string;
}
```

---

## 🚀 Next Steps

1. ✅ Test document creation
2. ✅ Test real-time editing
3. ✅ Test with multiple clients
4. ⬜ Add rich text formatting
5. ⬜ Add cursor indicators (visual markers)
6. ⬜ Add typing indicators
7. ⬜ Add document persistence
8. ⬜ Add user authentication

---

## 📞 Need Help?

- Check browser console for errors
- Check backend logs
- Review network tab in DevTools
- Test endpoints with curl/Postman

---

**Happy Coding! 🎉**
