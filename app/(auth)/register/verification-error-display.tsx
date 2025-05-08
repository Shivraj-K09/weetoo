// Add this component to display detailed error messages
export function VerificationErrorDisplay({ error }: { error: string | null }) {
  if (!error) return null;

  return (
    <div className="rounded-md bg-red-900/50 p-4 text-sm text-red-300 border border-red-800 overflow-auto max-h-48">
      <div className="font-medium mb-1">Verification Error:</div>
      <div className="whitespace-pre-wrap break-words">{error}</div>
    </div>
  );
}
