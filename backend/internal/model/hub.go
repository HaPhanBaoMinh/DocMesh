package model

import "log"

type Hub struct {
	Clients    map[string]*Client
	Broadcast  chan []byte
	Register   chan *Client
	Unregister chan *Client
	Document   Document
}

func NewHub(doc Document) *Hub {
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
			// 🔁 Broadcast to all clients
			for _, client := range h.Clients {
				select {
				case client.Send <- message:
				default:
					// If the send buffer is full, remove the client
					close(client.Send)
					delete(h.Clients, client.ID)
				}
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
