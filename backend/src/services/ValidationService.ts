/**
 * Validate summarization request
 */
export const validateSummaryRequest = (
  content: string,
  title?: string
): { isValid: boolean; error?: string } => {
  if (!content || typeof content !== "string") {
    return {
      isValid: false,
      error: "Content is required and must be a string",
    };
  }

  if (content.trim().length === 0) {
    return { isValid: false, error: "Content cannot be empty" };
  }

  if (content.length > 50000) {
    return {
      isValid: false,
      error: "Content is too long (max 50,000 characters)",
    };
  }

  if (title && typeof title !== "string") {
    return { isValid: false, error: "Title must be a string" };
  }

  return { isValid: true };
};

/**
 * Validate URL for content extraction
 */
export const validateUrl = (
  url: string
): { isValid: boolean; error?: string } => {
  if (!url || typeof url !== "string") {
    return { isValid: false, error: "URL is required and must be a string" };
  }

  try {
    new URL(url);

    // Check if it's HTTP or HTTPS
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return {
        isValid: false,
        error: "URL must start with http:// or https://",
      };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: "Invalid URL format" };
  }
};
