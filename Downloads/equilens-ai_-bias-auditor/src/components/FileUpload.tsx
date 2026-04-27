import React, { useCallback } from 'react';
import Papa from 'papaparse';
import { Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileUploadProps {
  onDataLoaded: (data: any[], fileName: string) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded, isLoading }) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file) return;
    
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        onDataLoaded(results.data, file.name);
      },
      error: (error) => {
        console.error("CSV Parse Error:", error);
      }
    });
  }, [onDataLoaded]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      handleFile(file);
    }
  }, [handleFile]);

  return (
    <div 
      className="w-full"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
    >
      <label className={`
        relative flex flex-col items-center justify-center w-full h-72 
        border-2 border-dashed rounded-3xl cursor-pointer
        transition-all duration-300 ease-in-out
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-500/10' 
          : 'border-slate-800 hover:border-slate-700 bg-slate-900/30'}
      `}>
        <div className="flex flex-col items-center justify-center p-8">
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: isDragging ? 1.1 : 1 }}
            className="mb-6 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 shadow-inner"
          >
            <Upload className={`w-10 h-10 ${isDragging ? 'text-indigo-400' : 'text-slate-500'}`} />
          </motion.div>
          <p className="mb-2 text-sm text-slate-200 font-semibold tracking-tight text-center">
            <span className="text-indigo-400">Click to audit dataset</span> or drag and drop
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Secure Local CSV Upload</p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          disabled={isLoading}
        />
      </label>
    </div>
  );
};
