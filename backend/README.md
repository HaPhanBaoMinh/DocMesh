# 🧠 Operational Transformation (OT) – Go Implementation

This package (`ot`) provides the core data structures for implementing an **Operational Transformation (OT)** system — the foundation of real-time collaborative editing (e.g., Google Docs).

It defines how text operations (insert, delete, retain) are represented, grouped into transactions (deltas), and later applied or transformed.

---

## 📦 Package Structure

```
/internal/ot/
├── operation.go   # Defines OperationType, Operation, Delta
├── document.go    # Defines Document struct and Apply function
├── cursor.go      # Cursor struct and logic for position adjustment
├── transform.go   # (Future) Logic to transform concurrent deltas
├── queue.go       # Simple channel-based DeltaQueue
└── utils.go       # Optional helper functions
```

---

## ⚙️ Core Data Structures

### 1. `OperationType`
```go
type OperationType string

const (
	OpInsert OperationType = "insert"
	OpDelete OperationType = "delete"
	OpRetain OperationType = "retain"
)
```

**Purpose:**  
Defines the **type of text manipulation** a user performs.

| Type | Description | Example |
|------|--------------|----------|
| `insert` | Insert new text into the document | Add `"abc"` at position 10 |
| `delete` | Remove a specific range of text | Delete 5 chars starting at position 20 |
| `retain` | Skip over part of the document without modification | Keep 10 chars unchanged before next op |

---

### 2. `Operation`
```go
type Operation struct {
	Type   OperationType `json:"type"`
	Pos    int            `json:"pos"`
	Length int            `json:"length"`
	Text   string         `json:"text"`
}
```

**Purpose:**  
Represents a single, atomic edit action within a document.  

**Fields Explained:**

| Field | Description | Used For |
|--------|-------------|----------|
| `Type` | The operation type (`insert`, `delete`, or `retain`) | All |
| `Pos` | The zero-based starting position of the operation | All |
| `Length` | Number of characters affected | Only for `delete` or `retain` |
| `Text` | Text content being inserted | Only for `insert` |

**Example JSON:**

```json
{ "type": "insert", "pos": 5, "text": "Hello" }
{ "type": "delete", "pos": 10, "length": 3 }
```

---

### 3. `Delta`
```go
type Delta struct {
	ClientID  string       `json:"client_id"`
	Version   int          `json:"version"`
	Ops       []Operation  `json:"ops"`
	Timestamp int64        `json:"timestamp"`
}
```

**Purpose:**  
A `Delta` groups multiple `Operation`s into a **logical transaction**.  
It represents one batch of changes a client sends to the server.

**Fields Explained:**

| Field | Description | Example |
|--------|-------------|----------|
| `ClientID` | Unique identifier for the client/user who made the change | `"client_123"` |
| `Version` | Version of the document at the time of the edit | `12` |
| `Ops` | List of individual operations that make up the delta | `[OpInsert, OpDelete]` |
| `Timestamp` | Time (UNIX epoch) when the delta was created | `1738889400` |

**Example JSON:**

```json
{
  "client_id": "userA",
  "version": 12,
  "ops": [
    { "type": "insert", "pos": 10, "text": "hi" },
    { "type": "delete", "pos": 15, "length": 3 },
    { "type": "retain", "pos": 20, "length": 5 }
  ],
  "timestamp": 1738889400
}
```

---

## 🧩 Relationship between Structs

```
Delta
 ├── ClientID: "userA"
 ├── Version: 12
 └── Ops:
      ├── { Type: insert, Pos: 10, Text: "hi" }
      ├── { Type: delete, Pos: 15, Length: 3 }
      └── { Type: retain, Pos: 20, Length: 5 }
```

👉 This means:  
At document version 12, userA inserted “hi” at position 10,  
deleted 3 characters at position 15,  
and retained 5 characters after that.

---

## 🧠 How It Works (Simplified Flow)

1. **Client Edit → Delta Creation**  
   - User types or deletes text.  
   - Client batches these edits into a `Delta`.

2. **Send to Server Queue**  
   - Server receives the delta and pushes it into a queue.

3. **Apply Delta to Document**  
   - Server applies the operations in sequence.  
   - Document version increases by 1.

4. **Broadcast Update to All Clients**  
   - Updated document content and version are sent to all other clients.  
   - Clients adjust their cursors accordingly.

---

## 🖱️ Cursor Tracking (Next Step)

Each user’s cursor position can also be tracked and updated when applying deltas.

Example struct:

```go
type Cursor struct {
	ClientID string `json:"client_id"`
	Pos      int    `json:"pos"`
	Anchor   int    `json:"anchor"`
	Color    string `json:"color"`
}
```

When an operation is applied:
- If text is inserted before the cursor → move cursor forward.  
- If text is deleted before the cursor → move cursor backward.

Example update logic:
```go
func UpdateCursor(cursor *Cursor, op Operation) {
	switch op.Type {
	case OpInsert:
		if op.Pos <= cursor.Pos {
			cursor.Pos += len([]rune(op.Text))
		}
	case OpDelete:
		if op.Pos < cursor.Pos {
			cursor.Pos -= min(cursor.Pos - op.Pos, op.Length)
		}
	}
}
```

---

## 🔁 Queueing and Version Control

Each `Delta` can be queued before being applied to the document.

Example:
```go
type DeltaQueue struct {
	Queue chan Delta
}

func NewDeltaQueue(size int) *DeltaQueue {
	return &DeltaQueue{
		Queue: make(chan Delta, size),
	}
}

func (dq *DeltaQueue) Push(delta Delta) {
	dq.Queue <- delta
}
```

A background goroutine reads from the queue and sequentially applies each delta to maintain consistency.

---

## 📘 Next Extensions

- **`Document` struct** → store content and version  
- **`Apply(delta)`** → modify content using operations  
- **`Transform(a, b)`** → resolve concurrent edits  
- **`Cursor synchronization`** → update cursor across clients  
- **`WebSocket integration`** → real-time communication  

---

## 🧾 Summary

| Concept | Description |
|----------|-------------|
| **Operation** | The smallest unit of change (insert/delete/retain). |
| **Delta** | A collection of operations representing one user action. |
| **Version** | Keeps the document consistent between clients and server. |
| **Queue** | Ensures ordered application of changes. |
| **Cursor** | Tracks and adjusts user positions dynamically. |

---

### 📄 Author
This implementation is part of the **Operational Transformation model in Go**, built for a real-time collaborative web editor project (Google Docs–like architecture).
