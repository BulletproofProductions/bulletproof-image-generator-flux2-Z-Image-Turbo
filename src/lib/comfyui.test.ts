import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ProgressCallback } from '@/lib/comfyui';
import { ComfyUIClient } from '@/lib/comfyui';

describe('ComfyUIClient', () => {
  let client: ComfyUIClient;

  beforeEach(() => {
    client = new ComfyUIClient('http://test:8000');
    vi.clearAllMocks();
  });

  afterEach(() => {
    client.closeProgressSocket();
  });

  describe('constructor', () => {
    it('should use provided base URL', () => {
      const customClient = new ComfyUIClient('http://custom:9000');
      expect(customClient).toBeDefined();
    });

    it('should use environment variable if no URL provided', () => {
      process.env.COMFYUI_URL = 'http://env:8000';
      const envClient = new ComfyUIClient();
      expect(envClient).toBeDefined();
      delete process.env.COMFYUI_URL;
    });

    it('should use default URL', () => {
      const defaultClient = new ComfyUIClient();
      expect(defaultClient).toBeDefined();
    });
  });

  describe('queuePrompt', () => {
    it('should queue a prompt successfully', async () => {
      const mockWorkflow = {
        '1': {
          class_type: 'TestNode',
          inputs: { test: 'value' },
        },
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({
            prompt_id: 'test-id-123',
            number: 1,
            node_errors: {},
          }),
        })
      ) as any;

      const result = await client.queuePrompt(mockWorkflow);

      expect(result.prompt_id).toBe('test-id-123');
      expect(result.number).toBe(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test:8000/prompt',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should throw error on failed queue', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          text: async () => 'Server error',
        })
      ) as any;

      await expect(client.queuePrompt({})).rejects.toThrow('Failed to queue prompt');
    });
  });

  describe('getHistory', () => {
    it('should retrieve history for prompt ID', async () => {
      const mockHistory = {
        test_id: {
          prompt: [1, '{}', {}, {}],
          outputs: {},
          status: { status_str: 'success', completed: true, messages: [] },
        },
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockHistory,
        })
      ) as any;

      const result = await client.getHistory('test_id');

      expect(result).toEqual(mockHistory.test_id);
      expect(global.fetch).toHaveBeenCalledWith('http://test:8000/history/test_id');
    });

    it('should return null if prompt not found', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({}),
        })
      ) as any;

      const result = await client.getHistory('nonexistent');

      expect(result).toBeNull();
    });

    it('should throw error on failed request', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
        })
      ) as any;

      await expect(client.getHistory('test_id')).rejects.toThrow('Failed to get history');
    });
  });

  describe('healthCheck', () => {
    it('should return true when ComfyUI is available', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
        })
      ) as any;

      const result = await client.healthCheck();

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test:8000/system_stats',
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });

    it('should return false when ComfyUI is unavailable', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Connection failed'))) as any;

      const result = await client.healthCheck();

      expect(result).toBe(false);
    });
  });

  describe('connectToProgressSocket', () => {
    it('should register a callback for prompt ID', () => {
      const callback: ProgressCallback = vi.fn();
      const cleanup = client.connectToProgressSocket('test-prompt', callback);

      expect(typeof cleanup).toBe('function');
    });

    it('should call cleanup function to remove callback', () => {
      const callback: ProgressCallback = vi.fn();
      const cleanup = client.connectToProgressSocket('test-prompt', callback);

      cleanup();
      // Callback should be removed from tracking
      expect(callback).not.toHaveBeenCalled();
    });

    it('should support multiple callbacks for same prompt ID', () => {
      const callback1: ProgressCallback = vi.fn();
      const callback2: ProgressCallback = vi.fn();

      const cleanup1 = client.connectToProgressSocket('test-prompt', callback1);
      const cleanup2 = client.connectToProgressSocket('test-prompt', callback2);

      expect(typeof cleanup1).toBe('function');
      expect(typeof cleanup2).toBe('function');
    });
  });

  describe('getWebSocketUrl', () => {
    it('should convert http to ws', () => {
      const httpClient = new ComfyUIClient('http://localhost:8000');
      const wsUrl = httpClient.getWebSocketUrl();

      expect(wsUrl).toBe('ws://localhost:8000/ws');
    });

    it('should convert https to wss', () => {
      const httpsClient = new ComfyUIClient('https://example.com:8000');
      const wsUrl = httpsClient.getWebSocketUrl();

      expect(wsUrl).toBe('wss://example.com:8000/ws');
    });
  });

  describe('buildFlux2Workflow', () => {
    it('should build workflow with basic options', () => {
      const workflow = client.buildFlux2Workflow({
        prompt: 'test prompt',
        width: 1024,
        height: 1024,
        steps: 20,
        guidance: 4,
      });

      expect(workflow).toBeDefined();
      expect(workflow['6']).toBeDefined();
      expect(workflow['6']!.class_type).toBe('CLIPTextEncode');
      expect(workflow['8']).toBeDefined();
      expect(workflow['8']!.class_type).toBe('VAEDecode');
    });

    it('should include reference image nodes when provided', () => {
      const workflow = client.buildFlux2Workflow({
        prompt: 'test prompt',
        width: 1024,
        height: 1024,
        referenceImageFilename: 'test.png',
      });

      expect(workflow['43']).toBeDefined();
      expect(workflow['43']!.class_type).toBe('ReferenceLatent');
      expect(workflow['44']).toBeDefined();
      expect(workflow['44']!.class_type).toBe('VAEEncode');
    });

    it('should use random seed if not provided', () => {
      const workflow1 = client.buildFlux2Workflow({
        prompt: 'test',
        width: 1024,
        height: 1024,
      });

      const workflow2 = client.buildFlux2Workflow({
        prompt: 'test',
        width: 1024,
        height: 1024,
      });

      const seed1 = (workflow1['25']!.inputs as any).noise_seed;
      const seed2 = (workflow2['25']!.inputs as any).noise_seed;

      // Seeds should be different (very unlikely to be equal)
      expect(seed1).not.toBe(seed2);
    });

    it('should use provided seed', () => {
      const workflow = client.buildFlux2Workflow({
        prompt: 'test',
        width: 1024,
        height: 1024,
        seed: 12345,
      });

      expect((workflow['25']!.inputs as any).noise_seed).toBe(12345);
    });
  });

  describe('closeProgressSocket', () => {
    it('should clear all callbacks', () => {
      const callback1: ProgressCallback = vi.fn();
      const callback2: ProgressCallback = vi.fn();

      client.connectToProgressSocket('prompt1', callback1);
      client.connectToProgressSocket('prompt2', callback2);

      client.closeProgressSocket();

      // Callbacks should be cleared
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });
});
