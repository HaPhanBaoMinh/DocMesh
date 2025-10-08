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
