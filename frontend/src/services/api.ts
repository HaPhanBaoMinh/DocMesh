// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Type definitions matching backend models
export interface Document {
  id: string;
  name: string;
  content: string;
  version: number;
}

export interface Operation {
  type: 'insert' | 'delete' | 'retain';
  pos: number;
  length?: number;
  text?: string;
}

export interface Delta {
  client_id: string;
  version: number;
  ops: Operation[];
  timestamp: number;
}

export interface Cursor {
  client_id: string;
  position: number;
  name: string;
}

export interface CreateDocumentRequest {
  name: string;
  content?: string;
}

export interface CreateDocumentResponse {
  id: string;
  name: string;
  content: string;
  version: number;
}

// API service class
class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Create a new document
   */
  async createDocument(data: CreateDocumentRequest): Promise<CreateDocumentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  /**
   * Get WebSocket URL for a document
   */
  getWebSocketUrl(docId: string, clientId: string, clientName: string): string {
    const wsProtocol = this.baseUrl.startsWith('https') ? 'wss' : 'ws';
    const wsBaseUrl = this.baseUrl.replace(/^https?/, wsProtocol);
    
    const params = new URLSearchParams({
      docId,
      clientId,
      clientName,
    });

    return `${wsBaseUrl}/ws?${params.toString()}`;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService(API_BASE_URL);

// Export for testing or custom instances
export default ApiService;
