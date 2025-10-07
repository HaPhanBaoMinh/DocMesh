package doc_handler

import "github.com/google/uuid"

func GenerateID() string {
	return uuid.New().String()
}
