package model

type Document struct {
	ID      string `json:"id"`
	Content string `json:"content"`
	Version int    `json:"version"`
	Name    string `json:"name"`
}
