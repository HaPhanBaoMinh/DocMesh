package model

import "fmt"

type Document struct {
	ID      string `json:"id"`
	Content string `json:"content"`
	Version int    `json:"version"`
	Name    string `json:"name"`
}

func NewDocument(id string, name string, content string, version int) *Document {
	return &Document{
		ID:      id,
		Name:    name,
		Content: content,
		Version: version,
	}
}

func (d *Document) ToString() string {
	return fmt.Sprintf("Document{ID: %s, Name: %s, Content: %s, Version: %d}", d.ID, d.Name, d.Content, d.Version)
}
