"use client";

import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Loader2, Key } from "lucide-react";

interface GeminiKeyModalProps {
  onKeySet: (key: string) => void;
}

export function GeminiKeyModal({ onKeySet }: GeminiKeyModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem("gemini_api_key");
    if (storedKey) {
      // Validate stored key silently or just trust it?
      // For this POC, let's just trigger the onKeySet if it exists.
      // But maybe we should validate it to ensure it's still good?
      // Let's just trust it for now to avoid blocking startup, if it fails later we can handle it.
      onKeySet(storedKey);
    } else {
      setIsOpen(true);
    }
  }, [onKeySet]);

  const validateAndSaveKey = async () => {
    setIsValidating(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      await model.generateContent("Hello");

      localStorage.setItem("gemini_api_key", apiKey);
      onKeySet(apiKey);
      setIsOpen(false);
    } catch (err) {
      console.error("Invalid API Key:", err);
      setError("Invalid API Key. Please check and try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndSaveKey();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-blue-500/10 p-3 ring-1 ring-blue-500/50">
            <Key className="h-6 w-6 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Gemini API Key</h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter your Google Gemini API key to get started with FileSearch.
            Your key is stored locally in your browser.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API Key"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 text-center animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isValidating || !apiKey}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2"
          >
            {isValidating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              "Connect"
            )}
          </button>
        </form>
        
        <div className="mt-4 text-center">
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-4">
                Get an API Key
            </a>
        </div>
      </div>
    </div>
  );
}
