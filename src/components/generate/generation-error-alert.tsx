"use client";

import { AlertCircle, XCircle, RefreshCw, Server } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface GenerationErrorAlertProps {
  error: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

// Error type detection and friendly messages
function getErrorInfo(error: string): {
  title: string;
  message: string;
  action?: "comfyui" | "retry" | "none";
} {
  const errorLower = error.toLowerCase();

  // ComfyUI not running
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

  // Workflow execution errors
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

  // Timeout errors
  if (errorLower.includes("timeout") || errorLower.includes("timed out")) {
    return {
      title: "Generation Timeout",
      message:
        "The generation took too long and timed out. Try reducing the number of steps or image resolution.",
      action: "retry",
    };
  }

  // Content policy errors
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

  // Network errors
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

  // Default error
  return {
    title: "Generation Failed",
    message: error || "An unexpected error occurred. Please try again.",
    action: "retry",
  };
}

export function GenerationErrorAlert({
  error,
  onDismiss,
  onRetry,
}: GenerationErrorAlertProps) {
  const { title, message, action } = getErrorInfo(error);

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        {title}
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
          {action === "comfyui" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Server className="h-4 w-4" />
              <span>Start ComfyUI: <code className="bg-muted px-1 rounded">python main.py --port 8000</code></span>
            </div>
          )}
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
