package ws

import (
	"docmesh/internal/model"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Allow all origins for development
		return true
	},
}

type WebSocketHandler struct {
	// Add fields if necessary
}

func NewWebSocketHandler() *WebSocketHandler {
	return &WebSocketHandler{}
}

func (h *WebSocketHandler) WsEntryHandler(hm *model.HubManager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get query parameters (support both docID and docId)
		docID := r.URL.Query().Get("docID")
		if docID == "" {
			docID = r.URL.Query().Get("docId")
		}
		clientID := r.URL.Query().Get("clientId")

		// Validate
		if docID == "" {
			http.Error(w, "missing docId parameter", http.StatusBadRequest)
			return
		}
		if clientID == "" {
			clientID = "anonymous"
		}

		log.Printf("WebSocket request: docID=%s, clientID=%s", docID, clientID)

		// Upgrade HTTP to WebSocket
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("Failed to upgrade: %v", err)
			return
		}

		// Get or create hub
		hub := hm.GetOrCreateHub(docID)
		client := model.NewClient(clientID, conn, hub)
		hub.AddClient(client)

		// Start client read pump
		go client.ReadPump()
		// Start client write pump
		go client.WritePump()
		// Log connection
		log.Printf("Client %s connected to hub for document %s", clientID, hub.Document.ID)
	}
}
