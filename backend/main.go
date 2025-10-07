package main

import (
	"log"
	"your-project/internal/ot"
	"your-project/internal/ws"
)

func main() {
	doc := ot.NewDocument("doc-001", "Hello World")
	queue := ot.NewDeltaQueue(100)

	go ws.StartServer(doc, queue)

	log.Println("Server running at :8080")
	select {}
}
