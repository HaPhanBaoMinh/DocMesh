package main

import (
	"docmesh/doc_handler"
	"docmesh/model"
	"flag"
	"log"
	"net/http"
)

func main() {
	flag.Parse()
	hubMgr := model.NewHubManager()
	docHandler := doc_handler.NewDocumentHandler()

	// Initialize and start your server here, passing hubMgr as needed
	mux := http.NewServeMux()
	mux.HandleFunc("/create", docHandler.CreateDocumentHandler(hubMgr))
	mux.HandleFunc("/ws", docHandler.ServeWs(hubMgr))

	// Start the server
	addr := ":8080"
	log.Printf("listening on %s", addr)
	err := http.ListenAndServe(addr, mux)
	if err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
