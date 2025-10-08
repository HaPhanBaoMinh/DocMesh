import type { CreateDocumentRequest, CreateDocumentResponse } from '../model/types';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Re-export types for backward compatibility
export type { 
  Document, 
  Operation, 
  Client, 
  Delta, 
  Cursor, 
  CreateDocumentRequest, 
  CreateDocumentResponse 
} from '../model/types';

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
