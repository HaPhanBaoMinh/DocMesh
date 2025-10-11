package model

import (
	"encoding/json"
	"log"
)

type Hub struct {
	Clients    map[string]*Client
	Broadcast  chan []byte
	Register   chan *Client
	Unregister chan *Client
	Document   *Document
}

func NewHub(doc *Document) *Hub {
	return &Hub{
		Clients:    make(map[string]*Client),
		Broadcast:  make(chan []byte),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Document:   doc,
	}
}

func (h *Hub) Run() {
	for {
		select {

		case client := <-h.Register:
			h.Clients[client.ID] = client
			log.Printf("✅ Client %s connected", client.ID)

		case client := <-h.Unregister:
			if _, ok := h.Clients[client.ID]; ok {
				delete(h.Clients, client.ID)
				close(client.Send)
				log.Printf("❌ Client %s disconnected", client.ID)
			}

		case message := <-h.Broadcast:
			var base struct {
				Type   string  `json:"type"`
				Delta  *Delta  `json:"delta"`
				Cursor *Cursor `json:"cursor"`
			}

			if err := json.Unmarshal(message, &base); err != nil {
				log.Printf("Invalid message format: %v", err)
				continue
			}

			log.Printf("Message type: %s", base.Type)
			switch base.Type {
			case "operation":
				log.Printf("Parsed base: %+v", base)

				err := h.Document.ApplyDelta(*base.Delta)
				if err != nil {
					log.Printf("ApplyDelta failed: %v", err)
				} else {
					log.Printf("Document after applying delta: %s", h.Document.ToString())
				}

				log.Printf("Broadcast operation from client %s: %+v", base.Delta.ClientID, base.Delta)
				base.Delta.BaseVersion = h.Document.Version

				// broadcast to all clients
				for _, c := range h.Clients {
					if c.ID != base.Delta.ClientID {
						payload, err := json.Marshal(base)
						if err != nil {
							log.Printf("Failed to marshal operation: %v", err)
							continue
						}

						select {
						case c.Send <- payload:
							log.Printf("📤 Sent update to client %s", c.ID)
						default:
							close(c.Send)
							delete(h.Clients, c.ID)
						}
					}
				}

			default:
				log.Printf("Unknown message type: %s", base.Type)
			}
		}
	}
}

func (h *Hub) AddClient(client *Client) {
	h.Register <- client // ✅ Register client
}

func (h *Hub) RemoveClient(clientID string) {
	if client, ok := h.Clients[clientID]; ok {
		h.Unregister <- client // ✅ Unregister client
	}
}

func (h *Hub) GetClient(clientID string) (*Client, bool) {
	client, ok := h.Clients[clientID]
	return client, ok
}
