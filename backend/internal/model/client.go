package model

import (
	"log"
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 512
)

type Client struct {
	ID   string
	Conn *websocket.Conn
	Send chan []byte
	Hub  *Hub
}

func NewClient(id string, conn *websocket.Conn, hub *Hub) *Client {
	return &Client{
		ID:   id,
		Conn: conn,
		Send: make(chan []byte, 256),
		Hub:  hub,
	}
}

func (c *Client) ReadPump() {
	defer func() {
		log.Printf("❌ Client %s disconnected", c.ID)
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()
	c.Conn.SetReadLimit(maxMessageSize)
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})
	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			log.Printf("Read error from %s: %v", c.ID, err)
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		c.Hub.Broadcast <- message
		log.Printf("📥 Received from %s: %s", c.ID, message)
	}
}

func (c *Client) WritePump() {
	defer func() {
		c.Conn.Close()
		c.Hub.Unregister <- c
	}()
	ticker := time.NewTicker(54 * time.Second)
	for {
		select {
		case message, ok := <-c.Send:
			if !ok {
				// Channel closed
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				log.Printf("🔒 Connection closed for %s", c.ID)
				return
			}
			err := c.Conn.WriteMessage(websocket.TextMessage, message)
			if err != nil {
				return
			}
			log.Printf("📤 Sent to %s: %s", c.ID, message)
		case <-ticker.C:
			// Send ping
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (c *Client) Close() {
	c.Hub.RemoveClient(c.ID)
	c.Conn.Close()
	close(c.Send)
}
