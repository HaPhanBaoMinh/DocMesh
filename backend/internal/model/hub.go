package model

type Hub struct {
	Clients   map[string]*Client
	Broadcast chan []byte
	Document  Document
}

func NewHub(doc Document) *Hub {
	return &Hub{
		Clients:   make(map[string]*Client),
		Broadcast: make(chan []byte),
		Document:  doc,
	}
}

func (h *Hub) AddClient(client *Client) {
	h.Clients[client.ID] = client
}

func (h *Hub) RemoveClient(clientID string) {
	if client, ok := h.Clients[clientID]; ok {
		client.Close()
		delete(h.Clients, clientID)
	}
}

func (h *Hub) GetClient(clientID string) (*Client, bool) {
	client, ok := h.Clients[clientID]
	return client, ok
}
