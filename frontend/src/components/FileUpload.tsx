"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Check, FileText, X } from "lucide-react";

interface FileUploadProps {
  apiKey: string;
  onFilesUploaded: (fileUris: string[]) => void;
}

export function FileUpload({ apiKey, onFilesUploaded }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; uri: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check local storage for previously uploaded files
    const storedFiles = localStorage.getItem("gemini_uploaded_files");
    if (storedFiles) {
      try {
        const files = JSON.parse(storedFiles);
        setUploadedFiles(files);
        onFilesUploaded(files.map((f: { uri: string }) => f.uri));
      } catch (e) {
        console.error("Failed to parse stored files", e);
      }
    }
  }, [onFilesUploaded]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported");
      return;
    }

    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(10); // Start progress

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("apiKey", apiKey);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setUploadProgress(100);

      const newFile = { name: file.name, uri: data.fileUri };
      const updatedFiles = [...uploadedFiles, newFile];
      
      setUploadedFiles(updatedFiles);
      localStorage.setItem("gemini_uploaded_files", JSON.stringify(updatedFiles));
      onFilesUploaded(updatedFiles.map(f => f.uri));
      
    } catch (err: unknown) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload file");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const clearFiles = () => {
    setUploadedFiles([]);
    localStorage.removeItem("gemini_uploaded_files");
    onFilesUploaded([]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          Document Upload
        </h3>
        
        {uploadedFiles.length > 0 ? (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 p-2 rounded-full">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-green-400">Documents Ready</p>
                  <p className="text-sm text-green-500/60">{uploadedFiles.length} file(s) available for search</p>
                </div>
              </div>
              <button 
                onClick={clearFiles}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                title="Clear files"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-400 pl-2">
                    <FileText className="w-3 h-3" />
                    <span className="truncate">{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div 
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed border-zinc-700 rounded-lg p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer hover:border-blue-500/50 hover:bg-zinc-800/50 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept="application/pdf"
              />
              <div className="bg-zinc-800 p-4 rounded-full mb-4">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-300 font-medium mb-1">Click to upload PDF</p>
              <p className="text-gray-500 text-sm">Supported format: .pdf</p>
            </div>
            
            {isUploading && (
               <div className="space-y-2">
                 <div className="flex justify-between text-sm text-gray-400">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                 </div>
                 <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-500 transition-all duration-300 ease-out" 
                        style={{ width: `${uploadProgress}%` }}
                    />
                 </div>
               </div>
            )}
          </div>
        )}

        {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                {error}
            </div>
        )}
      </div>
    </div>
  );
}
