/DocMesh
│
├── main.go                # Initialize server, queue, WebSocket handler
│
├── go.mod
│
├── /internal/
│   ├── /ot/               # Core OT logic (pure algorithm)
│   │   ├── operation.go   # Operation, Delta struct
│   │   ├── document.go    # Document struct & apply logic
│   │   ├── transform.go   # OT transform logic (to be implemented)
│   │   ├── cursor.go      # Cursor struct & update logic
│   │   ├── queue.go       # DeltaQueue (goroutine, channel)
│   │   └── utils.go       # Helper functions if needed
│   │
│   ├── /storage/          # Document storage (in-memory / Redis / file)
│   │   └── store.go
│   │
│   ├── /ws/               # WebSocket / HTTP handler for real-time communication
│   │   └── handler.go
│
└── /pkg/
    └── logger/            # (optional) custom logger or middleware
