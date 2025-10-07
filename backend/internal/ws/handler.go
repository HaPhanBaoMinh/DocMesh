package ws

import (
	"docmesh/internal/model"
	"log"
	"net/http"
)

type WebSocketHandler struct {
	// Add fields if necessary
}

func NewWebSocketHandler() *WebSocketHandler {
	return &WebSocketHandler{}
}

func (h *WebSocketHandler) WsEntryHandler(hm *model.HubManager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		docID := r.URL.Query().Get("docID")

		if docID == "" {
			http.Error(w, "missing docID", http.StatusBadRequest)
			return
		}

		hub := hm.GetOrCreateHub(docID)
		wsHandler(hub, w, r)
	}
}

func wsHandler(h *model.Hub, w http.ResponseWriter, r *http.Request) {
	log.Println("WebSocket connection established")
}
