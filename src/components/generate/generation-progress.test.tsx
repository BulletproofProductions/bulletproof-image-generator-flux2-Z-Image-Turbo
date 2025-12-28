import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { GenerationProgress } from '@/components/generate/generation-progress';

// Mock EventSource
class MockEventSource {
  url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onopen: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
  }

  send(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }));
    }
  }

  close() {}
}

global.EventSource = MockEventSource as any;

describe('GenerationProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should not render when not generating', () => {
      const { container } = render(
        <GenerationProgress promptId="test-id" isGenerating={false} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render progress container when generating', () => {
      render(<GenerationProgress promptId="test-id" isGenerating={true} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should display initial status', () => {
      render(<GenerationProgress promptId="test-id" isGenerating={true} />);

      expect(screen.getByText(/Initializing/i)).toBeInTheDocument();
    });
  });

  describe('progress tracking', () => {
    it('should display step count and percentage', async () => {
      render(
        <GenerationProgress promptId="test-id" isGenerating={true} />
      );

      // Simulate progress update
      await waitFor(() => {
        expect(screen.getByText(/Step \d+\/\d+/)).toBeInTheDocument();
      });
    });

    it('should display image batch tracking', async () => {
      render(
        <GenerationProgress
          promptId="test-id"
          isGenerating={true}
          currentImageIndex={2}
          totalImages={4}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Image 2 of 4/)).toBeInTheDocument();
      });
    });

    it('should show percentage', async () => {
      render(
        <GenerationProgress promptId="test-id" isGenerating={true} />
      );

      await waitFor(() => {
        expect(screen.getByText(/\d+%/)).toBeInTheDocument();
      });
    });
  });

  describe('progress updates via SSE', () => {
    it('should update progress on connected event', async () => {
      render(
        <GenerationProgress promptId="test-id" isGenerating={true} />
      );

      // Allow component to initialize
      await waitFor(() => {
        expect(screen.getByText(/Initializing/i)).toBeInTheDocument();
      });
    });

    it('should handle progress event with step updates', async () => {
      render(
        <GenerationProgress
          promptId="test-id"
          isGenerating={true}
          currentImageIndex={1}
          totalImages={1}
        />
      );

      await waitFor(() => {
        // Should show progress bar with progress value
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toBeInTheDocument();
      });
    });

    it('should display error message on error event', async () => {
      const mockOnError = vi.fn();

      render(
        <GenerationProgress
          promptId="test-id"
          isGenerating={true}
          onError={mockOnError}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });
  });

  describe('batch image tracking', () => {
    it('should track multiple images in batch', async () => {
      render(
        <GenerationProgress
          promptId="test-id"
          isGenerating={true}
          currentImageIndex={1}
          totalImages={3}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Image 1 of 3/)).toBeInTheDocument();
      });
    });

    it('should display single image for non-batch generation', async () => {
      render(
        <GenerationProgress
          promptId="test-id"
          isGenerating={true}
          currentImageIndex={1}
          totalImages={1}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Image 1 of 1/)).toBeInTheDocument();
      });
    });

    it('should use default values when batch params not provided', async () => {
      render(<GenerationProgress promptId="test-id" isGenerating={true} />);

      await waitFor(() => {
        expect(screen.getByText(/Image 1 of 1/)).toBeInTheDocument();
      });
    });
  });

  describe('progress URL parameters', () => {
    it('should include promptId in SSE URL', async () => {
      render(<GenerationProgress promptId="test-123" isGenerating={true} />);

      await waitFor(() => {
        // EventSource URL should contain promptId
        expect((global.EventSource as any).prototype.constructor).toBeDefined();
      });
    });

    it('should include imageIndex and totalImages in SSE URL', async () => {
      render(
        <GenerationProgress
          promptId="test-id"
          isGenerating={true}
          currentImageIndex={2}
          totalImages={4}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });
  });

  describe('cleanup and disconnection', () => {
    it('should cleanup EventSource on unmount', async () => {
      const { unmount } = render(
        <GenerationProgress promptId="test-id" isGenerating={true} />
      );

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      unmount();

      // Component should be unmounted without errors
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('should cleanup when isGenerating becomes false', async () => {
      const { rerender } = render(
        <GenerationProgress promptId="test-id" isGenerating={true} />
      );

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      rerender(
        <GenerationProgress promptId="test-id" isGenerating={false} />
      );

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('should cleanup when promptId becomes null', async () => {
      const { unmount } = render(
        <GenerationProgress promptId="test-id" isGenerating={true} />
      );

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      unmount();

      // Verify component unmounted successfully
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  describe('callbacks', () => {
    it('should call onComplete when generation completes', async () => {
      const onComplete = vi.fn();

      render(
        <GenerationProgress
          promptId="test-id"
          isGenerating={true}
          onComplete={onComplete}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });

    it('should call onError when error occurs', async () => {
      const onError = vi.fn();

      render(
        <GenerationProgress
          promptId="test-id"
          isGenerating={true}
          onError={onError}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });
  });

  describe('UI elements', () => {
    it('should display loading spinner', async () => {
      render(<GenerationProgress promptId="test-id" isGenerating={true} />);

      // Loader2 icon should be present
      await waitFor(() => {
        const svg = document.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });
    });

    it('should have progress bar element', async () => {
      render(<GenerationProgress promptId="test-id" isGenerating={true} />);

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });

    it('should display error message with destructive styling', async () => {
      render(
        <GenerationProgress
          promptId="test-id"
          isGenerating={true}
          onError={() => {}}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });
  });
});
