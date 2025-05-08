// Enhance the error display component to show more structured information
export function VerificationErrorDisplay({ error }: { error: string | null }) {
  if (!error) return null;

  // Try to parse JSON error details if present
  let errorTitle = "Verification Error";
  let errorDetails = error;

  try {
    if (error.includes("{") && error.includes("}")) {
      const jsonStartIndex = error.indexOf("{");
      const jsonEndIndex = error.lastIndexOf("}") + 1;
      const jsonPart = error.substring(jsonStartIndex, jsonEndIndex);
      const errorObj = JSON.parse(jsonPart);

      if (errorObj.code) {
        errorTitle = `Error Code: ${errorObj.code}`;
      }

      if (errorObj.message) {
        errorDetails = errorObj.message;
      } else {
        // Remove the JSON part from the original error
        errorDetails = error.replace(jsonPart, "").trim();
        if (errorDetails.endsWith(":")) {
          errorDetails = errorDetails.slice(0, -1).trim();
        }
      }
    }
  } catch (e) {
    // If parsing fails, use the original error message
    console.log("Error parsing error details:", e);
  }

  return (
    <div className="rounded-md bg-red-900/50 p-4 text-sm text-red-300 border border-red-800 overflow-auto max-h-48">
      <div className="font-medium mb-1">{errorTitle}:</div>
      <div className="whitespace-pre-wrap break-words">{errorDetails}</div>
    </div>
  );
}
