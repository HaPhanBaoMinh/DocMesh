# 🎨 DocMesh Frontend - Collaborative Editor UI

A modern, real-time collaborative text editor built with **React**, **TypeScript**, and **Vite**. The frontend communicates with the Go backend via WebSocket to enable Google Docs-like real-time collaboration.

---

## 🚀 Features

- ✅ **Real-time collaboration** with multiple users
- ✅ **Live cursor tracking** for all connected users
- ✅ **Document creation** with public/private modes
- ✅ **Shareable links** for easy collaboration
- ✅ **Clean, modern UI** with Tailwind CSS
- ✅ **Type-safe** with TypeScript
- ✅ **Fast development** with Vite HMR

---

## 📦 Project Structure

```
frontend/
├── src/
│   ├── App.tsx          # Main application component (routing & state)
│   ├── Editor.tsx       # Collaborative text editor component
│   ├── InfoBar.tsx      # Info bar showing user count and version
│   ├── main.tsx         # Application entry point
│   ├── App.css          # Application styles
│   ├── index.css        # Global styles (Tailwind base)
│   └── assets/          # Static assets (icons, images)
│
├── public/              # Static files
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── postcss.config.cjs   # PostCSS configuration
```

---

## 🏗️ Application Flow

### **User Journey**

```
┌──────────────┐
│ Step 1       │
│ Enter Name   │  → User enters their display name
└──────┬───────┘
       │
┌──────▼───────┐
│ Step 2       │
│ Create Doc   │  → User creates a new document
│              │     (title, public/private, password)
└──────┬───────┘
       │
┌──────▼───────┐
│ Step 3       │
│ Editor       │  → Real-time collaborative editing
│              │     (WebSocket connection active)
└──────────────┘
```

---

## 🧩 Component Architecture

### **1. App.tsx**
Main application component that manages routing and global state.

**State Management:**
```typescript
const [step, setStep] = useState<"user" | "create" | "editor">("user");
const [user, setUser] = useState("");        // Current user name
const [doc, setDoc] = useState<Doc | null>(null);
const [text, setText] = useState("");        // Document content
const [rev, setRev] = useState(0);           // Document version
```

**Steps:**
- **Step 1 (user):** User enters their name
- **Step 2 (create):** User creates a document
- **Step 3 (editor):** Real-time collaborative editing

---

### **2. Editor.tsx**
The main text editor component with WebSocket integration.

**Key Responsibilities:**
- Establishes WebSocket connection to backend
- Sends operations (insert/delete) to server
- Receives and applies remote operations
- Tracks local cursor position
- Handles real-time synchronization

**Props:**
```typescript
interface EditorProps {
  value: string;
  onChange: (newValue: string) => void;
}
```

---

### **3. InfoBar.tsx**
Displays document metadata and user information.

**Props:**
```typescript
interface InfoBarProps {
  user: string;  // Current user name
  rev: number;   // Document version
}
```

**Displays:**
- Current user name
- Document version (revision number)
- Number of connected users (future)

---

## 🔌 WebSocket Integration

### **Connection**

```typescript
const ws = new WebSocket(
  `ws://localhost:8080/ws?docId=${docId}&clientId=${clientId}&clientName=${userName}`
);
```

**Query Parameters:**
- `docId`: Unique document identifier
- `clientId`: Unique client UUID
- `clientName`: Display name for the user

---

### **Message Protocol**

#### **1. Server → Client: Initial State**
```typescript
{
  type: "init",
  document: {
    id: "doc123",
    content: "Hello World",
    version: 5,
    name: "My Document"
  },
  clients: [
    { client_id: "user1", position: 5, name: "Alice" },
    { client_id: "user2", position: 10, name: "Bob" }
  ]
}
```

#### **2. Client → Server: Send Operation**
```typescript
ws.send(JSON.stringify({
  type: "operation",
  delta: {
    client_id: clientId,
    version: currentVersion,
    ops: [
      { type: "insert", pos: 10, text: "Hello" }
    ],
    timestamp: Date.now()
  },
  cursor: {
    client_id: clientId,
    position: cursorPosition,
    name: userName
  }
}));
```

#### **3. Server → Client: Broadcast Operation**
```typescript
{
  type: "operation",
  delta: {
    client_id: "user456",
    version: 6,
    ops: [
      { type: "insert", pos: 5, text: "world" }
    ],
    timestamp: 1738889400
  },
  cursor: {
    client_id: "user456",
    position: 10,
    name: "Bob"
  }
}
```

#### **4. Client → Server: Cursor Update**
```typescript
ws.send(JSON.stringify({
  type: "cursor",
  cursor: {
    client_id: clientId,
    position: newCursorPosition,
    name: userName
  }
}));
```

---

## 🎨 UI Components

### **Step 1: Enter Name**
```typescript
<div className="flex items-center justify-center h-screen bg-gray-50">
  <div className="p-6 bg-white shadow rounded-xl w-96">
    <h1>Enter your name</h1>
    <input 
      type="text" 
      placeholder="Your name"
      className="w-full border rounded p-2"
    />
    <button onClick={() => setStep("create")}>
      Continue
    </button>
  </div>
</div>
```

### **Step 2: Create Document**
```typescript
<div className="flex items-center justify-center h-screen bg-gray-50">
  <div className="p-6 bg-white shadow rounded-xl w-96">
    <h1>Create Document</h1>
    <input 
      type="text" 
      placeholder="Document title"
    />
    <div className="flex space-x-4">
      <label>
        <input type="radio" checked={type === "public"} />
        <span>Public</span>
      </label>
      <label>
        <input type="radio" checked={type === "private"} />
        <span>Private</span>
      </label>
    </div>
    <button onClick={handleCreateDoc}>Create</button>
  </div>
</div>
```

### **Step 3: Editor**
```typescript
<div className="flex flex-col h-screen">
  <header className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
    <div className="font-semibold">{doc.title}</div>
    <div className="flex items-center space-x-4">
      <button onClick={handleCopyLink}>Get Link</button>
      <div>👤 {user}</div>
    </div>
  </header>
  
  <InfoBar user={user} rev={rev} />
  <Editor value={text} onChange={setText} />
</div>
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first CSS framework |
| **WebSocket API** | Real-time communication |
| **ESLint** | Code linting |

---

## 🔧 Installation & Setup

### **Prerequisites**
- Node.js 18+ and npm
- Backend server running on `http://localhost:8080`

### **Install Dependencies**
```bash
cd frontend
npm install
```

### **Run Development Server**
```bash
npm run dev
```

The app will start on `http://localhost:5173` (default Vite port)

### **Build for Production**
```bash
npm run build
```

Output will be in `dist/` folder.

### **Preview Production Build**
```bash
npm run preview
```

---

## 📝 Scripts

```json
{
  "dev": "vite",                    // Start dev server
  "build": "tsc -b && vite build",  // Build for production
  "lint": "eslint .",               // Run linter
  "preview": "vite preview"         // Preview production build
}
```

---

## 🧪 Development Workflow

### **1. Start Backend**
```bash
cd backend
go run main.go
```

### **2. Start Frontend**
```bash
cd frontend
npm run dev
```

### **3. Open Browser**
Navigate to `http://localhost:5173`

---

## 🎯 Key Features Implementation

### **1. Real-time Collaboration**

The editor uses WebSocket to synchronize changes:

```typescript
// Editor.tsx (simplified)
const handleChange = (newText: string) => {
  const oldText = value;
  const ops = generateOperations(oldText, newText);
  
  // Send to server
  ws.send(JSON.stringify({
    type: "operation",
    delta: {
      client_id: clientId,
      ops: ops,
      version: currentVersion,
      timestamp: Date.now()
    }
  }));
  
  // Update local state
  onChange(newText);
};

// Listen for remote changes
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  
  if (msg.type === "operation") {
    applyRemoteOperation(msg.delta);
  }
};
```

---

### **2. Cursor Tracking**

Track cursor position and send updates:

```typescript
const handleCursorChange = (position: number) => {
  ws.send(JSON.stringify({
    type: "cursor",
    cursor: {
      client_id: clientId,
      position: position,
      name: userName
    }
  }));
};
```

---

### **3. Document Sharing**

Generate and copy shareable link:

```typescript
function handleCopyLink() {
  const link = `${window.location.origin}/docs/${encodeURIComponent(doc.title)}`;
  navigator.clipboard.writeText(link);
  alert("Link copied!");
}
```

---

## 🎨 Styling Guide

### **Tailwind Configuration**

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### **Color Scheme**
- **Primary:** Gray-800 (`#1f2937`)
- **Background:** Gray-50 (`#f9fafb`)
- **Accent:** Gray-700 (`#374151`)
- **Text:** Gray-700 (`#374151`)

---

## 🐛 Troubleshooting

### **WebSocket connection fails**
```
Error: WebSocket connection to 'ws://localhost:8080/ws' failed
```

**Solutions:**
- Ensure backend server is running
- Check if port 8080 is available
- Verify WebSocket URL is correct

---

### **TypeScript errors**
```
Error: Property 'XXX' does not exist on type 'YYY'
```

**Solutions:**
- Run `npm install @types/XXX`
- Check `tsconfig.json` settings
- Ensure all imports are correct

---

### **Vite dev server not starting**
```
Error: Port 5173 is already in use
```

**Solutions:**
- Kill process using port 5173
- Use different port: `vite --port 3000`

---

## 🔮 Future Enhancements

- [ ] **Rich text editor** (bold, italic, underline)
- [ ] **Real-time cursor indicators** (show other users' cursors)
- [ ] **Presence awareness** (online/offline status)
- [ ] **Document history** (view past versions)
- [ ] **Comments & annotations**
- [ ] **Export to PDF/DOCX**
- [ ] **Syntax highlighting** for code blocks
- [ ] **Mobile responsive design**
- [ ] **Dark mode support**
- [ ] **Keyboard shortcuts** (Ctrl+S, Ctrl+Z)
- [ ] **User avatars**
- [ ] **Typing indicators**

---

## 📚 Learn More

### **React**
- [React Documentation](https://react.dev/)
- [React Hooks](https://react.dev/reference/react)

### **Vite**
- [Vite Guide](https://vite.dev/guide/)
- [Vite Configuration](https://vite.dev/config/)

### **TypeScript**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### **Tailwind CSS**
- [Tailwind Docs](https://tailwindcss.com/docs)

---

## 📄 License

MIT License - feel free to use this project for learning or production!

---

## 👨‍💻 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with ❤️ using React, TypeScript, and WebSocket**
