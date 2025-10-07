package doc_handler

import (
	"docmesh/model"
	"net/http"
)

type DocumentHandler struct {
	// Add fields if necessary
}

func NewDocumentHandler() *DocumentHandler {
	return &DocumentHandler{}
}

func (dh *DocumentHandler) createDocumentHandler(hm *model.HubManager, name string) *model.Document {
	docID := GenerateID()
	model.Document{
		ID:      docID,
		Content: "",
		Version: 1,
		Name:    name,
	}
	hm.GetOrCreateHub(docID)

	// response
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(docID))

	}
}
