package model

import (
	"github.com/gorilla/websocket"
)

type Client struct {
	ID   string
	Conn *websocket.Conn
	Send chan []byte
}

func (c *Client) Close() {
	c.Conn.Close()
	close(c.Send)
}
