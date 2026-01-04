/**
 * @fileoverview Generation Error Alert Component
 * 
 * This component displays user-friendly error messages when image generation fails.
 * It analyzes error strings to categorize errors and provide appropriate guidance.
 * 
 * ## Error Categories
 * 
 * | Category | Indicators | Action |
 * |----------|------------|--------|
 * | ComfyUI Not Running | "comfyui", "not running", "503" | Show start command |
 * | Workflow Error | "workflow", "execution failed", "node" | Retry available |
 * | Timeout | "timeout", "timed out" | Suggest lower settings |
 * | Content Policy | "content policy", "safety", "blocked" | Prompt modification |
 * | Network Error | "network", "connection", "fetch failed" | Retry available |
 * 
 * ## Usage
 * 
 * ```tsx
 * {error && (
 *   <GenerationErrorAlert
 *     error={error}
 *     onDismiss={() => setError(null)}
 *     onRetry={handleGenerate}
 *   />
 * )}
 * ```
 * 
 * @module components/generate/generation-error-alert
 */

"use client";

import { AlertCircle, XCircle, RefreshCw, Server } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * Props for the GenerationErrorAlert component
 */
interface GenerationErrorAlertProps {
  /** The error message string to analyze and display */
  error: string;
  /** Callback to dismiss the error alert */
  onDismiss?: () => void;
  /** Callback to retry the failed generation */
  onRetry?: () => void;
}

/**
 * Error classification result with user-friendly messaging
 */
interface ErrorInfo {
  /** Short title for the error type */
  title: string;
  /** Detailed user-friendly message explaining the error */
  message: string;
  /** Suggested action: "comfyui" shows start command, "retry" shows retry button */
  action?: "comfyui" | "retry" | "none";
}

/**
 * Analyzes an error string and returns user-friendly error information
 * 
 * Uses keyword matching to classify errors into categories:
 * - ComfyUI server issues (503, not running)
 * - Workflow execution failures
 * - Request timeouts
 * - Content policy violations
 * - Network connectivity issues
 * 
 * @param error - The raw error message string
 * @returns Classified error info with title, message, and suggested action
 */
function getErrorInfo(error: string): ErrorInfo {
  const errorLower = error.toLowerCase();

  // ComfyUI not running - User needs to start the server
  if (
    errorLower.includes("comfyui") ||
    errorLower.includes("not running") ||
    errorLower.includes("503")
  ) {
    return {
      title: "ComfyUI Not Running",
      message:
        "ComfyUI server is not available. Please start ComfyUI on port 8000 and try again.",
      action: "comfyui",
    };
  }

  // Workflow execution errors - Usually model loading or node issues
  if (
    errorLower.includes("workflow") ||
    errorLower.includes("execution failed") ||
    errorLower.includes("node")
  ) {
    return {
      title: "Workflow Error",
      message:
        "There was an error executing the ComfyUI workflow. Check that all required models are loaded.",
      action: "retry",
    };
  }

  // Timeout errors - Generation took too long
  if (errorLower.includes("timeout") || errorLower.includes("timed out")) {
    return {
      title: "Generation Timeout",
      message:
        "The generation took too long and timed out. Try reducing the number of steps or image resolution.",
      action: "retry",
    };
  }

  // Content policy errors - Prompt was flagged
  if (
    errorLower.includes("content policy") ||
    errorLower.includes("safety") ||
    errorLower.includes("blocked") ||
    errorLower.includes("harmful")
  ) {
    return {
      title: "Content Policy Violation",
      message:
        "Your prompt was blocked due to content policy. Please modify your prompt and try again.",
      action: "none",
    };
  }

  // Network errors - Connection issues between Next.js and ComfyUI
  if (
    errorLower.includes("network") ||
    errorLower.includes("connection") ||
    errorLower.includes("fetch failed")
  ) {
    return {
      title: "Connection Error",
      message:
        "There was a problem connecting to ComfyUI. Please check that the server is running and try again.",
      action: "retry",
    };
  }

  // Default error - Unclassified error
  return {
    title: "Generation Failed",
    message: error || "An unexpected error occurred. Please try again.",
    action: "retry",
  };
}

/**
 * Displays a styled error alert with classified error messaging
 * 
 * Analyzes the error string to provide contextual help:
 * - For ComfyUI errors: Shows the command to start the server
 * - For retry-able errors: Shows a retry button
 * - For content policy errors: Only shows the message
 * 
 * @param props - Component props
 * @param props.error - The error message to display
 * @param props.onDismiss - Optional callback to dismiss the alert
 * @param props.onRetry - Optional callback to retry the generation
 * 
 * @returns Alert component with error information and actions
 */
export function GenerationErrorAlert({
  error,
  onDismiss,
  onRetry,
}: GenerationErrorAlertProps) {
  // Classify the error to get user-friendly messaging
  const { title, message, action } = getErrorInfo(error);

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        {title}
        {/* Dismiss button if callback provided */}
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 hover:bg-destructive/20"
          >
            <XCircle className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <span>{message}</span>
        <div className="flex flex-wrap gap-2">
          {/* ComfyUI start command for server errors */}
          {action === "comfyui" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Server className="h-4 w-4" />
              <span>Start ComfyUI: <code className="bg-muted px-1 rounded">python main.py --port 8000</code></span>
            </div>
          )}
          {/* Retry button for recoverable errors */}
          {(action === "retry" || action === "comfyui") && onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

