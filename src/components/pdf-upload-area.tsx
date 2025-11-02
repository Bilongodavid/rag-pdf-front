import type React from "react";
import { useState } from "react";
import { Upload } from "lucide-react";
import toast from "react-hot-toast";
interface PDFUploadAreaProps {
  onUpload: (file: File) => void;
}

export default function PDFUploadArea({ onUpload }: PDFUploadAreaProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;

    if (files && files[0].type === "application/pdf") {
      const size = 5 * 1024 * 1024;
      if (files[0].size > size) {
        toast.error(
          "Le fichier est trop volumineux. La taille maximale est de 5 Mo."
        );
      } else {
        onUpload(files[0]);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      console.log(e.target.files[0].size);
      const size = 5 * 1024 * 1024;
      if (e.target.files[0].size > size) {
        toast.error(
          "Le fichier est trop volumineux. La taille maximale est de 5 Mo."
        );
      } else {
        onUpload(e.target.files[0]);
      }
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
        isDragActive
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500"
      }`}
    >
      <label className="cursor-pointer">
        <Upload
          className={`w-8 h-8 mx-auto mb-3 ${
            isDragActive
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-400 dark:text-gray-600"
          }`}
        />
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          Glissez-déposez votre PDF ici
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          ou cliquez pour parcourir
        </p>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
        />
      </label>
    </div>
  );
}
