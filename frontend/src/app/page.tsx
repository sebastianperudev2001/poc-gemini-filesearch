"use client";

import { useState } from "react";
import { GeminiKeyModal } from "@/components/GeminiKeyModal";
import { FileUpload } from "@/components/FileUpload";
import { ChatInterface } from "@/components/ChatInterface";
import { Sparkles } from "lucide-react";

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [fileUris, setFileUris] = useState<string[]>([]);

  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />
      
      <div className="relative max-w-5xl mx-auto px-4 py-8">
        <header className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Gemini 1.5 Flash</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Gemini FileSearch
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Upload your PDF documents and instantly chat with them using Google advanced AI models.
          </p>
        </header>

        <GeminiKeyModal onKeySet={setApiKey} />

        {apiKey && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <FileUpload 
              apiKey={apiKey} 
              onFilesUploaded={setFileUris} 
            />
            
            <ChatInterface 
              apiKey={apiKey} 
              fileUris={fileUris} 
            />
          </div>
        )}
      </div>
      
      <footer className="mt-20 py-6 text-center text-sm text-gray-600 border-t border-zinc-900">
        <p>Built with Next.js & Google Gemini API</p>
      </footer>
    </main>
  );
}
