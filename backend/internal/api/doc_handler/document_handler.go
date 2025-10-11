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

func (dh *DocumentHandler) GetDocumentHandler(hm *model.HubManager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Only accept GET requests
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Get docId from query params
		docID := r.URL.Query().Get("id")
		if docID == "" {
			http.Error(w, "missing document id", http.StatusBadRequest)
			return
		}

		// Check if hub exists (document was created)
		hub, exists := hm.GetHub(docID)
		if !exists {
			log.Printf("Document not found: %s", docID)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "Document not found",
			})
			return
		}

		doc := hub.Document

		// Prepare response
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
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(response)
	}
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
		// Create hub for this document
		hm.GetOrCreateHub(doc.ID)

		log.Printf("Created hub for document: %s", doc.ID)

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
