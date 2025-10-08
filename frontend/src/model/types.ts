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

export interface Client {
  id: string;
  name: string;
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
  type?: "public" | "private";
  password?: string;
}

export interface CreateDocumentResponse {
  id: string;
  name: string;
  content: string;
  version: number;
}
