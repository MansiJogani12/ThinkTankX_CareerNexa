"use client"

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UploadCloud, File, X, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function BulkUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const startProcessing = () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);

    // Simulate async batch processing via polling
    const total = files.length;
    let current = 0;
    
    const interval = setInterval(() => {
      current++;
      setProgress(Math.round((current / total) * 100));
      
      if (current >= total) {
        clearInterval(interval);
        setTimeout(() => {
          setIsProcessing(false);
          router.push('/candidates');
        }, 1000);
      }
    }, 800); // Process a file every 800ms
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4">
        <Link href="/candidates">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Bulk Upload Resumes</h1>
          <p className="text-gray-400 text-sm">Upload a ZIP file or multiple PDFs. The system will process them asynchronously.</p>
        </div>
      </div>

      <Card className="bg-gray-800/50 border-gray-700/50 border-dashed border-2">
        <CardContent className="p-12">
          <div 
            className="flex flex-col items-center justify-center text-center cursor-pointer"
            onClick={() => !isProcessing && fileInputRef.current?.click()}
          >
            <div className="p-4 bg-purple-600/10 rounded-full mb-4">
              <UploadCloud className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Click or drag files here</h3>
            <p className="text-gray-400 text-sm max-w-xs">Supports .pdf, .docx, and .zip archives containing multiple resumes.</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              accept=".pdf,.docx,.zip"
              onChange={handleFileSelect}
              disabled={isProcessing}
            />
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">{files.length} Files Selected</h3>
            <Button 
              onClick={startProcessing} 
              disabled={isProcessing}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              {isProcessing ? 'Processing Batch...' : 'Start Pipeline'}
            </Button>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Processing Candidates...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/80 rounded-lg border border-gray-700">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <File className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-sm text-gray-200 truncate">{file.name}</span>
                </div>
                {!isProcessing && (
                  <button onClick={() => removeFile(idx)} className="text-gray-500 hover:text-red-400 transition-colors shrink-0 ml-2">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
