import { toast } from "sonner";

export interface ApiError {
  status?: number;
  code?: string;
  message?: string;
  error?: {
    code?: string;
    message?: string;
  };
}

export const handleOpenAIError = (error: any): string => {
  // Log error only once, concisely
  console.error("API Error:", {
    status: error?.status,
    message: error?.message,
    code: error?.error?.code,
  });

  // Handle different types of API errors with generic user-friendly messages
  let errorMessage = "Sorry, something went wrong. Please try again.";

  if (error?.status) {
    switch (error.status) {
      case 401:
        errorMessage = "Service authentication issue. Please try again later.";
        break;
      case 402:
        errorMessage = "Service quota exceeded. Please try again later!";
        break;
      case 429:
        // Check if it's a billing/account issue first
        if (
          error?.message?.includes("account is not active") ||
          error?.message?.includes("billing details") ||
          error?.message?.includes("billing")
        ) {
          errorMessage = "Service quota exceeded. Please try again later!";
        } else if (
          error?.error?.code === "insufficient_quota" ||
          error?.message?.includes("quota")
        ) {
          errorMessage =
            "Daily usage limit reached. Please try again tomorrow!";
        } else if (
          error?.error?.code === "rate_limit_exceeded" ||
          error?.message?.includes("rate limit")
        ) {
          errorMessage =
            "Too many requests! Please wait a moment and try again.";
        } else {
          errorMessage = "Service busy. Please wait a moment and try again.";
        }
        break;
      case 500:
        errorMessage =
          "Service temporarily unavailable. Please try again in a few moments.";
        break;
      case 502:
      case 503:
      case 504:
        errorMessage = "Service is under maintenance. Please try again later.";
        break;
      default:
        // Check for specific error types in the error message
        if (
          error?.message?.includes("account is not active") ||
          error?.message?.includes("billing details") ||
          error?.message?.includes("billing") ||
          error?.message?.includes("payment")
        ) {
          errorMessage = "Service quota exceeded. Please try again later!";
        } else if (
          error?.message?.includes("insufficient_quota") ||
          error?.message?.includes("quota")
        ) {
          errorMessage =
            "Daily usage limit reached. Please try again tomorrow!";
        } else if (error?.message?.includes("insufficient")) {
          errorMessage = "Service quota exceeded. Please try again later!";
        } else if (error?.message) {
          errorMessage = "Something went wrong. Please try again.";
        }
    }
  } else if (error?.code === "ENOTFOUND" || error?.code === "ECONNREFUSED") {
    errorMessage = "Unable to connect. Please check your internet connection.";
  } else if (error?.message?.includes("fetch")) {
    errorMessage = "Network error. Please check your connection and try again.";
  }

  return errorMessage;
};

export const handleUploadError = (error: any): string => {
  console.error("Upload Error:", error);

  return "Upload functionality is currently unavailable.";
};

export const handleFirebaseError = (error: any): string => {
  console.error("Database Error:", error);

  let errorMessage = "Something went wrong. Please try again.";

  if (error?.code) {
    switch (error.code) {
      case "permission-denied":
        errorMessage = "You don't have permission to perform this action.";
        break;
      case "unavailable":
        errorMessage =
          "Service temporarily unavailable. Please try again later.";
        break;
      case "deadline-exceeded":
        errorMessage = "Request timed out. Please try again.";
        break;
      case "resource-exhausted":
        errorMessage = "Service quota exceeded. Please try again later.";
        break;
      case "unauthenticated":
        errorMessage = "Please sign in again to continue.";
        break;
      default:
        errorMessage = "Something went wrong. Please try again.";
    }
  } else {
    errorMessage = "Something went wrong. Please try again.";
  }

  return errorMessage;
};

// Helper function to show error toast with consistent styling
export const showErrorToast = (
  error: any,
  errorType: "openai" | "upload" | "firebase" | "general" = "general"
) => {
  let message: string;

  switch (errorType) {
    case "openai":
      message = handleOpenAIError(error);
      break;
    case "upload":
      message = handleUploadError(error);
      break;
    case "firebase":
      message = handleFirebaseError(error);
      break;
    default:
      message =
        error?.message || "An unexpected error occurred. Please try again.";
  }

  toast.error(message, {
    duration: 5000, // Show for 5 seconds for error messages
  });
};

// Helper to show success messages consistently
export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 3000, // Show for 3 seconds for success messages
  });
};

// Helper to show info messages consistently
export const showInfoToast = (message: string) => {
  toast.info(message, {
    duration: 4000, // Show for 4 seconds for info messages
  });
};
