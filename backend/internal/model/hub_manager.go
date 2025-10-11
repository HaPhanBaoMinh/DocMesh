package model

import (
	"log"
	"sync"
)

type HubManager struct {
	Hubs map[string]*Hub
	mu   sync.RWMutex
}

func NewHubManager() *HubManager {
	return &HubManager{
		Hubs: make(map[string]*Hub),
	}
}

func (hm *HubManager) GetHub(docID string) (*Hub, bool) {
	hm.mu.RLock()
	defer hm.mu.RUnlock()
	h, ok := hm.Hubs[docID]
	return h, ok
}

func (hm *HubManager) GetOrCreateHub(docID, docName string) *Hub {
	// Lock for reading first (use RLock for read-only access)
	hm.mu.RLock()
	h, ok := hm.Hubs[docID]
	hm.mu.RUnlock()

	if ok {
		return h
	}

	// If not found, lock for writing
	hm.mu.Lock()
	defer hm.mu.Unlock()

	// Double-check if the hub was created in the meantime
	h, ok = hm.Hubs[docID]
	if ok {
		return h
	}

	// Create a new hub if it doesn't exist
	doc := NewDocument(docID, docName, "", 0)
	newHub := NewHub(doc)
	hm.Hubs[docID] = newHub
	go newHub.Run()
	log.Printf("Created hub for document: %s", docID)
	return newHub
}

func (hm *HubManager) RemoveHub(docID string) {
	hm.mu.Lock()
	defer hm.mu.Unlock()

	delete(hm.Hubs, docID)
}
