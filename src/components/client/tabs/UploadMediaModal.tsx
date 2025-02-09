import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { usePortfolio } from '../../../hooks/usePortfolio';

interface UploadMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  onUploadSuccess: (files: File[], captions: string[]) => Promise<void>;
}

interface MediaFile {
  file: File;
  preview: string;
  caption: string;
}

export default function UploadMediaModal({ 
  isOpen, 
  onClose,
  serviceId,
  onUploadSuccess
}: UploadMediaModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const { uploadMedia } = usePortfolio();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        caption: ''
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleCaptionChange = (index: number, caption: string) => {
    setFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, caption } : f
    ));
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      await uploadMedia({
        serviceId,
        media: files.map(f => ({
          file: f.file,
          caption: f.caption
        }))
      });
      onUploadSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to upload media:', error);
    }
  };

  return (
    <Transition appear show={isOpen} as="div">
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Add Media to Service History
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Images/Video
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                  />
                </div>

                <div className="mt-6 space-y-4">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                        {file.file.type.startsWith('image') ? (
                          <img
                            src={file.preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={file.preview}
                            className="w-full h-full object-cover"
                            controls={false}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={file.caption}
                          onChange={(e) => handleCaptionChange(index, e.target.value)}
                          placeholder="Add a caption..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="p-2 text-gray-400 hover:text-gray-500"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={files.length === 0}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Upload Media
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
