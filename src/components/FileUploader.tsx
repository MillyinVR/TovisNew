// components/FileUploader.tsx
import React from 'react';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  label: string;
  onFileSelect: (file: File | null) => void;
  accept?: string;
  required?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  label,
  onFileSelect,
  accept = 'image/*,.pdf',
  required = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files?.[0] || null);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md">
        <div className="space-y-1 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-600">
            <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span>Upload a file</span>
              <input
                type="file"
                className="sr-only"
                accept={accept}
                required={required}
                onChange={handleChange}
              />
            </label>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, or PDF up to 10MB</p>
        </div>
      </div>
    </div>
  );
};
