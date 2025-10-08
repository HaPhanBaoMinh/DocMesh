package doc_handler

import (
	"docmesh/internal/model"
	"encoding/json"
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
		name := "Untitled Document"

		// Get doc name from POST body
		var req struct {
			Name string `json:"name"`
		}

		err := json.NewDecoder(r.Body).Decode(&req)
		if err == nil && req.Name != "" {
			name = req.Name
		}

		// validate name
		if name == "" {
			http.Error(w, "missing document name", http.StatusBadRequest)
			return
		}

		// create a new document

		docID := GenerateID()
		doc := &model.Document{
			ID:      docID,
			Name:    name,
			Content: "",
			Version: 0,
		}
		hm.GetOrCreateHub(doc.ID)

		// response
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(docID))
	}
}
