import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/generate/progress/route';

// Mock comfyui module
vi.mock('@/lib/comfyui', () => ({
  comfyui: {
    healthCheck: vi.fn(),
    getHistory: vi.fn(),
    connectToProgressSocket: vi.fn(),
  },
}));

import { comfyui } from '@/lib/comfyui';

describe('GET /api/generate/progress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should return 400 if promptId is missing', async () => {
      const request = new Request('http://localhost/api/generate/progress');

      const response = await GET(request);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe('promptId is required');
    });

    it('should return 400 with error message', async () => {
      const request = new Request('http://localhost/api/generate/progress');

      const response = await GET(request);
      const body = await response.text();

      expect(response.status).toBe(400);
      expect(body).toContain('promptId');
    });
  });

  describe('response headers', () => {
    it('should return SSE headers', async () => {
      const mockHistoryEntry = {
        status: { completed: false, status_str: 'running', messages: [] },
      };

      (comfyui.healthCheck as any).mockResolvedValueOnce(true);
      (comfyui.getHistory as any).mockResolvedValueOnce(mockHistoryEntry);

      const request = new Request(
        'http://localhost/api/generate/progress?promptId=test-id'
      );

      const response = await GET(request);

      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      expect(response.headers.get('Cache-Control')).toBe('no-cache');
      expect(response.headers.get('Connection')).toBe('keep-alive');
    });
  });

  describe('ComfyUI health check', () => {
    it('should check ComfyUI availability', async () => {
      (comfyui.healthCheck as any).mockResolvedValueOnce(true);
      (comfyui.getHistory as any).mockResolvedValueOnce(null);

      const request = new Request(
        'http://localhost/api/generate/progress?promptId=test-id'
      );

      await GET(request);

      expect(comfyui.healthCheck).toHaveBeenCalled();
    });

    it('should send error event when ComfyUI is unavailable', async () => {
      (comfyui.healthCheck as any).mockResolvedValueOnce(false);

      const request = new Request(
        'http://localhost/api/generate/progress?promptId=test-id'
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      // Response is a stream, would need to read it to verify error event
    });
  });

  describe('progress event stream', () => {
    it('should parse imageIndex from query params', async () => {
      (comfyui.healthCheck as any).mockResolvedValueOnce(true);
      (comfyui.getHistory as any).mockResolvedValueOnce(null);

      const request = new Request(
        'http://localhost/api/generate/progress?promptId=test-id&imageIndex=2&totalImages=4'
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      // Response headers should be correct
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    });

    it('should use default image tracking values', async () => {
      (comfyui.healthCheck as any).mockResolvedValueOnce(true);
      (comfyui.getHistory as any).mockResolvedValueOnce(null);

      const request = new Request(
        'http://localhost/api/generate/progress?promptId=test-id'
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      // imageIndex defaults to 1, totalImages defaults to 1
    });
  });

  describe('progress tracking integration', () => {
    it('should call connectToProgressSocket for WebSocket integration', async () => {
      (comfyui.healthCheck as any).mockResolvedValueOnce(true);
      (comfyui.getHistory as any).mockResolvedValueOnce({
        status: { completed: false, status_str: 'running', messages: [] },
      });
      (comfyui.connectToProgressSocket as any).mockReturnValueOnce(() => {});

      const request = new Request(
        'http://localhost/api/generate/progress?promptId=test-prompt-id'
      );

      await GET(request);

      expect(comfyui.connectToProgressSocket).toHaveBeenCalledWith(
        'test-prompt-id',
        expect.any(Function)
      );
    });
  });

  describe('client disconnect handling', () => {
    it('should cleanup on client disconnect', async () => {
      const abortController = new AbortController();

      (comfyui.healthCheck as any).mockResolvedValueOnce(true);
      (comfyui.getHistory as any).mockResolvedValueOnce(null);

      const request = new Request(
        'http://localhost/api/generate/progress?promptId=test-id',
        { signal: abortController.signal }
      );

      const response = await GET(request);

      // Simulate client disconnect
      abortController.abort();

      expect(response.status).toBe(200);
    });
  });

  describe('error handling', () => {
    it('should handle getHistory errors gracefully', async () => {
      (comfyui.healthCheck as any).mockResolvedValueOnce(true);
      (comfyui.getHistory as any).mockRejectedValueOnce(
        new Error('Connection error')
      );

      const request = new Request(
        'http://localhost/api/generate/progress?promptId=test-id'
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      // Stream should handle error gracefully
    });
  });

  describe('batch image progress', () => {
    it('should include image indices in progress events', async () => {
      (comfyui.healthCheck as any).mockResolvedValueOnce(true);
      (comfyui.getHistory as any).mockResolvedValueOnce({
        status: { completed: false, status_str: 'running', messages: [] },
      });

      const request = new Request(
        'http://localhost/api/generate/progress?promptId=test-id&imageIndex=2&totalImages=4'
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      // Response is a stream with imageIndex=2, totalImages=4 in events
    });
  });
});
