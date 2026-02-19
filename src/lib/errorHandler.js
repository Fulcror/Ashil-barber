export class AppError extends Error {
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function handleRouteError(error, context = "") {
  // Log everything server-side
  console.error(`[${context}] Error:`, error);

  if (error instanceof AppError) {
    return Response.json(
      { success: false, error: error.message },
      { status: error.statusCode },
    );
  }

  // Generic error for unknown exceptions - never expose details
  return Response.json(
    { success: false, error: "An error occurred. Please try again." },
    { status: 500 },
  );
}
