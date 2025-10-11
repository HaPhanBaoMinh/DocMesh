import { useState, useCallback, useEffect } from 'react';
import type { CreateDocumentRequest, CreateDocumentResponse } from '../model/types';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Hook for creating a new document
 */
export function useCreateDocument() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<CreateDocumentResponse | null>(null);

	const createDocument = useCallback(async (request: CreateDocumentRequest) => {
		setError(null);

		try {
			setIsLoading(true);
			const response = await fetch(`${API_BASE_URL}/create`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(request),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result: CreateDocumentResponse = await response.json();
			setData(result);
			return result;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to create document';
			setError(errorMessage);
			console.error('Error creating document:', err);
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, []);

	const reset = useCallback(() => {
		setData(null);
		setError(null);
		setIsLoading(false);
	}, []);

	return {
		createDocument,
		isLoading,
		error,
		data,
		reset,
	};
}

/**
 * Hook for health check
 */
export function useHealthCheck() {
	const [isChecking, setIsChecking] = useState(false);
	const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
	const [error, setError] = useState<string | null>(null);

	const checkHealth = useCallback(async () => {
		setIsChecking(true);
		setError(null);

		try {
			const response = await fetch(`${API_BASE_URL}/health`);
			const healthy = response.ok;
			setIsHealthy(healthy);
			return healthy;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Health check failed';
			setError(errorMessage);
			setIsHealthy(false);
			console.error('Health check failed:', err);
			return false;
		} finally {
			setIsChecking(false);
		}
	}, []);

	return {
		checkHealth,
		isChecking,
		isHealthy,
		error,
	};
}

/**
 * Hook to get WebSocket URL
 * This is a utility hook that doesn't make API calls
 */
export function useWebSocketUrl() {
	const getWebSocketUrl = useCallback((docId: string, clientId: string): string => {
		const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
		const wsBaseUrl = API_BASE_URL.replace(/^https?/, wsProtocol);

		const params = new URLSearchParams({
			docId,
			clientId,
		});

		return `${wsBaseUrl}/ws?${params.toString()}`;
	}, []);

	return { getWebSocketUrl };
}

/**
 * Hook for general API configuration
 */
export function useApiConfig() {
	return {
		baseUrl: API_BASE_URL,
	};
}

/**
 * Hook for getting document by ID
 */
export function useGetDocument(docId: string) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [document, setDocument] = useState<CreateDocumentResponse | null>(null);

	const fetchDocument = useCallback(async () => {
		if (!docId) return;

		setIsLoading(true);
		setError(null);

		const maxAttempts = 3;
		const retryDelayMs = 1000;

		for (let attempt = 1; attempt <= maxAttempts; attempt++) {
			try {
				const response = await fetch(`${API_BASE_URL}/document?id=${docId}`);

				if (response.status === 404) {
					if (attempt < maxAttempts) {
						// chờ rồi retry
						await new Promise(res => setTimeout(res, retryDelayMs));
						continue;
					} else {
						throw new Error('Document not found (404)');
					}
				}

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const doc: CreateDocumentResponse = await response.json();
				setDocument(doc);
				return doc;
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Failed to fetch document';
				setError(errorMessage);
				console.error(`Error fetching document, attempt ${attempt}:`, err);

				if (attempt === maxAttempts) {
					return null;
				}
				await new Promise(res => setTimeout(res, retryDelayMs));
			} finally {
				setIsLoading(false);
			}
		}

		return null;
	}, [docId]);


	useEffect(() => {
		fetchDocument();
	}, [fetchDocument]);

	return {
		document,
		isLoading,
		error,
		refetch: fetchDocument,
	};
}

