package ot

// OperationType describes the type of operation
type OperationType string

const (
	OpInsert OperationType = "insert"
	OpDelete OperationType = "delete"
	OpRetain OperationType = "retain"
)

// Operation represents a single change in the document
type Operation struct {
	Type   OperationType `json:"type"`   // insert, delete, retain
	Pos    int           `json:"pos"`    // starting position of the change
	Length int           `json:"length"` // length (used for delete or retain only)
	Text   string        `json:"text"`   // content (used for insert only)
}

// Delta is a list of operations that form a logical transaction
type Delta struct {
	ClientID  string      `json:"client_id"`
	Version   int         `json:"version"`
	Ops       []Operation `json:"ops"`
	Timestamp int64       `json:"timestamp"`
}
