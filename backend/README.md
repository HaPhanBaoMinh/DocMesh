# 📝 DocMesh Backend - Real-time Collaborative Editor

A Go-based backend server implementing **Operational Transformation (OT)** for real-time collaborative document editing, similar to Google Docs.

---

## 🚀 Features

- ✅ **Real-time collaboration** via WebSocket
- ✅ **Operational Transformation (OT)** for conflict-free concurrent editing
- ✅ **Multi-document support** with document management
- ✅ **Cursor tracking** for all connected users
- ✅ **Version control** to maintain document consistency
- ✅ **Scalable architecture** with hub-based client management

---

## 📦 Project Structure

```
backend/
├── main.go                          # Application entry point
├── go.mod                           # Go module dependencies
├── go.sum                           # Dependency checksums
│
├── internal/
│   ├── api/
│   │   └── doc_handler/             # HTTP handlers for document management
│   │       ├── document_handler.go  # Create/list/get documents
│   │       └── utils.go             # Helper functions
│   │
│   ├── model/                       # Core data structures
│   │   ├── client.go                # Client connection model
│   │   ├── document.go              # Document structure
│   │   ├── hub.go                   # Hub for managing clients per document
│   │   ├── hub_manager.go           # Manager for all document hubs
│   │   └── operation.go             # OT operations (Delta, Cursor)
│   │
│   ├── ws/                          # WebSocket communication
│   │   └── handler.go               # WebSocket connection handler
│   │
│   └── storage/                     # (Future) Persistent storage layer
│
└── pkg/                             # (Optional) Shared utilities
```

---

## 🏗️ Architecture

### **Hub-based Architecture**

```
┌─────────────────────────────────────────────────┐
│              HubManager                         │
│  Manages multiple documents                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │  Hub       │  │  Hub       │  │  Hub       │ │
│  │  (Doc A)   │  │  (Doc B)   │  │  (Doc C)   │ │
│  │            │  │            │  │            │ │
│  │  Clients:  │  │  Clients:  │  │  Clients:  │ │
│  │  - User1   │  │  - User3   │  │  - User5   │ │
│  │  - User2   │  │  - User4   │  │            │ │
│  └────────────┘  └────────────┘  └────────────┘ │
└─────────────────────────────────────────────────┘
```

Each document has its own **Hub** that:
- Manages connected clients
- Broadcasts operations to all clients
- Maintains document state and version
- Handles cursor updates

---

## ⚙️ Core Data Structures

### 1. **Operation**

Represents a single text edit action.

```go
type OperationType string

const (
    OpInsert OperationType = "insert"
    OpDelete OperationType = "delete"
    OpRetain OperationType = "retain"
)

type Operation struct {
    Type   OperationType `json:"type"`    // insert, delete, retain
    Pos    int           `json:"pos"`     // starting position
    Length int           `json:"length"`  // for delete/retain
    Text   string        `json:"text"`    // for insert
}
```

**Examples:**
```json
{ "type": "insert", "pos": 5, "text": "Hello" }
{ "type": "delete", "pos": 10, "length": 3 }
{ "type": "retain", "pos": 0, "length": 5 }
```

---

### 2. **Delta**

A transaction containing multiple operations.

```go
type Delta struct {
    ClientID  string      `json:"client_id"`
    Version   int         `json:"version"`
    Ops       []Operation `json:"ops"`
    Timestamp int64       `json:"timestamp"`
}
```

**Example:**
```json
{
  "client_id": "user123",
  "version": 5,
  "ops": [
    { "type": "insert", "pos": 10, "text": "world" }
  ],
  "timestamp": 1738889400
}
```

---

### 3. **Cursor**

Tracks user cursor position.

```go
type Cursor struct {
    ClientID string `json:"client_id"`
    Position int    `json:"position"`
    Name     string `json:"name"`
}
```

---

### 4. **Document**

Represents a collaborative document.

```go
type Document struct {
    ID      string `json:"id"`
    Content string `json:"content"`
    Version int    `json:"version"`
    Name    string `json:"name"`
}
```

---

## 🔌 API Endpoints

### **HTTP Endpoints**

#### 1. Create Document
```http
POST /create
Content-Type: application/json

{
  "name": "My Document",
  "content": "Initial content"
}

Response:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "My Document",
  "content": "Initial content",
  "version": 0
}
```

---

### **WebSocket Endpoint**

#### Connect to Document
```
ws://localhost:8080/ws?docId=<document-id>&clientId=<client-id>&clientName=<name>
```

**Query Parameters:**
- `docId`: Document ID to connect to
- `clientId`: Unique client identifier (UUID)
- `clientName`: Display name for the user

---

## 📡 WebSocket Message Protocol

### **Client → Server**

#### 1. Operation Message
```json
{
  "type": "operation",
  "delta": {
    "client_id": "user123",
    "version": 5,
    "ops": [
      { "type": "insert", "pos": 10, "text": "Hello" }
    ],
    "timestamp": 1738889400
  },
  "cursor": {
    "client_id": "user123",
    "position": 15,
    "name": "Alice"
  }
}
```

#### 2. Cursor Update
```json
{
  "type": "cursor",
  "cursor": {
    "client_id": "user123",
    "position": 20,
    "name": "Alice"
  }
}
```

---

### **Server → Client**

#### 1. Initial State
```json
{
  "type": "init",
  "document": {
    "id": "doc123",
    "content": "Hello World",
    "version": 5,
    "name": "My Document"
  },
  "clients": [
    { "client_id": "user1", "position": 5, "name": "Alice" },
    { "client_id": "user2", "position": 10, "name": "Bob" }
  ]
}
```

#### 2. Broadcast Operation
```json
{
  "type": "operation",
  "delta": { /* ... */ },
  "cursor": { /* ... */ }
}
```

#### 3. Broadcast Cursor
```json
{
  "type": "cursor",
  "cursor": {
    "client_id": "user123",
    "position": 25,
    "name": "Alice"
  }
}
```

---

## 🔧 Installation & Setup

### **Prerequisites**
- Go 1.22 or higher
- Git

### **Install Dependencies**
```bash
cd backend
go mod download
```

### **Run the Server**
```bash
go run main.go
```

The server will start on `http://localhost:8080`

## 🔄 Operational Transformation Flow

```
1. User types text
   ↓
2. Client creates Delta with Operations
   ↓
3. Client sends Delta to Server via WebSocket
   ↓
4. Server receives Delta
   ↓
5. Server applies Delta to Document
   ↓
6. Document version increments
   ↓
7. Server broadcasts Delta to all other clients
   ↓
8. Clients receive Delta and update their local state
   ↓
9. Clients adjust their cursors based on operations
```

---

## 🖱️ Cursor Adjustment Algorithm

When an operation is applied, all other users' cursors are adjusted:

### **Insert Operation**
```
Original text: "Hello World"
                     ^
                  cursor at 11

Insert " Beautiful" at position 6:
Result: "Hello Beautiful World"
                         ^
                    cursor at 21 (+10)
```

### **Delete Operation**
```
Original text: "Hello Beautiful World"
                         ^
                    cursor at 21

Delete 10 chars at position 6:
Result: "Hello World"
             ^
        cursor at 11 (-10)
```

---