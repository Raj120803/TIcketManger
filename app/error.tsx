"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-3xl font-bold text-red-500 mb-4">Something went wrong!</h2>
      <p className="text-neutral-300 mb-6 bg-neutral-900 p-4 rounded-xl border border-neutral-800 font-mono text-sm break-all">
        {error.message || "Unknown error occurred"}
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
