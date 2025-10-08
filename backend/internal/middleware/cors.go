package middleware

import (
	"net/http"
)

// CORSMiddleware adds CORS headers to allow cross-origin requests
func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow requests from frontend (adjust origin as needed)
		origin := r.Header.Get("Origin")

		// Allow localhost origins for development
		allowedOrigins := []string{
			"http://localhost:5173",
			"http://localhost:3000",
			"http://localhost:5174",
			"http://127.0.0.1:5173",
		}

		// Check if origin is allowed
		isAllowed := false
		for _, allowed := range allowedOrigins {
			if origin == allowed {
				isAllowed = true
				break
			}
		}

		if isAllowed {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}

		// Allow necessary headers
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Handle preflight request
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Continue to next handler
		next.ServeHTTP(w, r)
	})
}
