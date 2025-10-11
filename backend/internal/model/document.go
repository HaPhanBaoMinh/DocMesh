package model

import (
	"fmt"
	"log"
	"sync"
)

type Document struct {
	ID       string `json:"id"`
	Content  string `json:"content"`
	Version  int    `json:"version"`
	Name     string `json:"name"`
	mu       sync.RWMutex
	content  string
	DeltaLog []Delta
}

func (d *Document) IncrementVersion() {
	d.mu.Lock()
	defer d.mu.Unlock()
	d.Version++
}

func (d *Document) ApplyDelta(transaction Delta) error {
	d.mu.Lock()
	defer d.mu.Unlock()

	// 1. Check version validity
	if transaction.BaseVersion > d.Version {
		return fmt.Errorf(
			"version mismatch: client version %d is ahead of document version %d",
			transaction.BaseVersion, d.Version,
		)
	}

	// 2. Transform if client version < server version
	if transaction.BaseVersion < d.Version {
		if transaction.BaseVersion < 0 || transaction.BaseVersion >= len(d.DeltaLog) {
			return fmt.Errorf("invalid transaction version index: %d", transaction.BaseVersion)
		}

		toTransform := d.DeltaLog[transaction.BaseVersion:]
		for _, prev := range toTransform {
			var transformedOps []Operation
			for _, op := range transaction.Ops {
				for _, prevOp := range prev.Ops {
					op = Transform(op, prevOp)
				}
				transformedOps = append(transformedOps, op)
			}
			transaction.Ops = transformedOps
		}
	}

	// 3. Apply all operations (transformed or same-version)
	for _, op := range transaction.Ops {
		switch op.Type {
		case "insert":
			if op.Pos < 0 || op.Pos > len(d.Content) {
				return fmt.Errorf("invalid insert pos: %d (content len=%d)", op.Pos, len(d.Content))
			}
			d.Content = d.Content[:op.Pos] + op.Text + d.Content[op.Pos:]

		case "delete":
			if op.Pos < 0 || op.Pos+op.Length > len(d.Content) {
				log.Printf("Invalid delete operation: pos=%d, length=%d, content length=%d", op.Pos, op.Length, len(d.Content))
				continue
			}
			d.Content = d.Content[:op.Pos] + d.Content[op.Pos+op.Length:]

		case "retain":
			// Retain không thay đổi nội dung, chỉ phục vụ cho transform
			continue

		default:
			return fmt.Errorf("unknown operation type: %s", op.Type)
		}
	}

	// 4. Commit changes
	d.Version++
	d.DeltaLog = append(d.DeltaLog, transaction)

	log.Printf("✅ ApplyDelta success: docID=%s version=%d content=%q", d.ID, d.Version, d.Content)
	return nil
}

func Transform(opA, opB Operation) Operation {
	switch opB.Type {
	case "insert":
		if opA.Type == "insert" && opA.Pos > opB.Pos {
			opA.Pos += len(opB.Text)
		} else if opA.Type == "delete" && opA.Pos >= opB.Pos {
			opA.Pos += len(opB.Text)
		}

	case "delete":
		if opA.Type == "insert" && opA.Pos > opB.Pos {
			opA.Pos -= opB.Length
			if opA.Pos < opB.Pos {
				opA.Pos = opB.Pos
			}
		} else if opA.Type == "delete" {
			if opA.Pos >= opB.Pos && opA.Pos < opB.Pos+opB.Length {
				opA.Pos = opB.Pos
			} else if opA.Pos > opB.Pos {
				opA.Pos -= opB.Length
			}
		}
	}

	return opA
}

func NewDocument(id string, name string, content string, version int) *Document {
	return &Document{
		ID:       id,
		Name:     name,
		Content:  content,
		Version:  version,
		mu:       sync.RWMutex{},
		DeltaLog: []Delta{},
	}
}

func (d *Document) ToString() string {
	return fmt.Sprintf("Document{ID: %s, Name: %s, Content: %s, Version: %d}", d.ID, d.Name, d.Content, d.Version)
}
