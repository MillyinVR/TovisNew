import { useState } from 'react';
import { Upload, AlertCircle, FileText, Maximize2 } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => Promise<string | undefined>;
  multiple?: boolean;
  accept?: string;
  initialImage?: string;
  value?: string;
}

export const FileUpload = ({ onFileUpload, multiple, accept, initialImage }: FileUploadProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const [isPdf, setIsPdf] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const file = files[0];
    
    try {
      setLoading(true);
      setError(null);
      
      // Create preview
      if (file.type === 'application/pdf') {
        setIsPdf(true);
        setPreview(null);
      } else {
        setIsPdf(false);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }

      if (multiple) {
        // Process all selected files
        for (let i = 0; i < files.length; i++) {
          try {
            await onFileUpload(files[i]);
          } catch (error) {
            console.error(`Failed to upload file ${files[i].name}:`, error);
          }
        }
      } else {
        // Process only the first file
        await onFileUpload(file);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload file');
      setPreview(null);
    } finally {
      setLoading(false);
      // Clear the input to allow uploading the same file again
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept={accept || "image/*"}
              onChange={handleFileChange}
              disabled={loading}
              multiple={multiple}
            />
            <div className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>{loading ? 'Uploading...' : multiple ? 'Upload Photos' : 'Upload Photo'}</span>
            </div>
          </label>
        </div>
        {(preview || isPdf) && (
          <div className="flex-shrink-0">
            {isPdf ? (
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-md">
                <FileText className="h-6 w-6 text-gray-500" />
              </div>
            ) : (
              <div className="relative w-12 h-12 group">
                <img 
                  src={preview || ''} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded-md"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-md transition-all flex items-center justify-center">
                  <Maximize2 className="text-white opacity-0 group-hover:opacity-100 h-4 w-4" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center text-red-600 text-sm mt-1">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
