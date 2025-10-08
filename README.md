# 📝 DocMesh - Real-time Collaborative Editor

A modern, real-time collaborative document editor similar to Google Docs, built with **Go** (backend) and **React** (frontend). Features include live editing, cursor tracking, and Operational Transformation for conflict-free concurrent editing.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Go](https://img.shields.io/badge/Go-1.22+-00ADD8?logo=go)
![React](https://img.shields.io/badge/React-19+-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178C6?logo=typescript)

---

## 🚀 Features

### ✨ Core Features
- ✅ **Real-time collaboration** - Multiple users can edit simultaneously
- ✅ **Operational Transformation (OT)** - Conflict-free concurrent editing
- ✅ **Live cursor tracking** - See where other users are editing
- ✅ **Document versioning** - Track document changes over time
- ✅ **Multi-document support** - Create and manage multiple documents
- ✅ **WebSocket-based sync** - Fast, bidirectional communication

### 🎯 Advanced Features
- 📱 **Responsive UI** - Works on desktop and mobile
- 🎨 **Modern design** - Clean interface with Tailwind CSS
- 🔒 **Type-safe** - Full TypeScript support
- ⚡ **High performance** - Optimized for speed and scalability
- 🔄 **Auto-reconnect** - Handles network interruptions gracefully

---

## 📦 Project Structure

```
DocMesh/
├── backend/                    # Go backend server
│   ├── internal/
│   │   ├── api/               # HTTP handlers
│   │   ├── model/             # Data structures (OT, Document)
│   │   ├── ws/                # WebSocket handlers
│   │   └── storage/           # (Future) Persistence layer
│   ├── main.go                # Application entry point
│   ├── go.mod                 # Go dependencies
│   └── README.md              # Backend documentation
│
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── App.tsx           # Main component
│   │   ├── Editor.tsx        # Collaborative editor
│   │   ├── InfoBar.tsx       # Status bar
│   │   └── main.tsx          # Entry point
│   ├── package.json          # npm dependencies
│   ├── vite.config.ts        # Vite configuration
│   └── README.md             # Frontend documentation
│
├── docs/                      # Documentation
│   └── architecture.md        # Architecture details
│
├── scripts/                   # Utility scripts
│   └── run_dev.sh            # Development startup script
│
└── README.md                  # This file
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Go 1.22+** | High-performance backend language |
| **Gorilla WebSocket** | WebSocket library for Go |
| **UUID** | Unique identifier generation |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | Modern UI framework |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Fast build tool & dev server |
| **Tailwind CSS** | Utility-first CSS framework |
| **WebSocket API** | Real-time communication |
