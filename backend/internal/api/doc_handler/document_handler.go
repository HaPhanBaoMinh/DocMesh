package doc_handler

import (
	"docmesh/internal/model"
	"encoding/json"
	"log"
	"net/http"
)

type DocumentHandler struct {
	// Add fields if necessary
}

func NewDocumentHandler() *DocumentHandler {
	return &DocumentHandler{}
}

func (dh *DocumentHandler) CreateDocumentHandler(hm *model.HubManager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Only accept POST requests
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Get doc info from POST body
		var req struct {
			Name     string `json:"name"`
			Content  string `json:"content"`
			Type     string `json:"type"`
			Password string `json:"password"`
		}

		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		// Validate name
		if req.Name == "" {
			http.Error(w, "missing document name", http.StatusBadRequest)
			return
		}

		// Create a new document
		docID := GenerateID()
		content := req.Content
		if content == "" {
			content = "" // Empty content by default
		}

		doc := model.NewDocument(docID, req.Name, content, 0)
		log.Printf("Created document: ID=%s, Name=%s", doc.ID, doc.Name)

		// Create hub for this document
		hm.GetOrCreateHub(doc.ID)

		// Prepare response matching frontend CreateDocumentResponse interface
		response := struct {
			ID      string `json:"id"`
			Name    string `json:"name"`
			Content string `json:"content"`
			Version int    `json:"version"`
		}{
			ID:      doc.ID,
			Name:    doc.Name,
			Content: doc.Content,
			Version: doc.Version,
		}

		// Send JSON response
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)
	}
}
