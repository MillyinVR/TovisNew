import React, { useState } from 'react';
import { Camera, Plus, Save, X, Upload, AlertCircle } from 'lucide-react';
import { AftercareSummary, Product, ServiceSummary } from '../../../types/aftercare';
import { useAftercare } from '../../../hooks/useAftercare';
import { useAuth } from '../../../contexts/AuthContext';

interface AftercareSummaryCreatorProps {
  appointmentId: string;
  clientId: string;
  onSave: (summary: Omit<AftercareSummary, 'id' | 'status'>) => void;
  onCancel: () => void;
}

export const AftercareSummaryCreator: React.FC<AftercareSummaryCreatorProps> = ({
  appointmentId,
  clientId,
  onSave,
  onCancel
}) => {
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [beforeImageFiles, setBeforeImageFiles] = useState<File[]>([]);
  const [afterImageFiles, setAfterImageFiles] = useState<File[]>([]);
  const [beforeImagePreviews, setBeforeImagePreviews] = useState<string[]>([]);
  const [afterImagePreviews, setAfterImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createAftercareSummary } = useAftercare('professional');
  const { userProfile } = useAuth();
  const [aftercareInstructions, setAftercareInstructions] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const handleImageUpload = (type: 'before' | 'after', files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const previews = newFiles.map(file => URL.createObjectURL(file));

    if (type === 'before') {
      setBeforeImageFiles(prev => [...prev, ...newFiles]);
      setBeforeImagePreviews(prev => [...prev, ...previews]);
    } else {
      setAfterImageFiles(prev => [...prev, ...newFiles]);
      setAfterImagePreviews(prev => [...prev, ...previews]);
    }
  };

  const removeImage = (type: 'before' | 'after', index: number) => {
    if (type === 'before') {
      URL.revokeObjectURL(beforeImagePreviews[index]);
      setBeforeImageFiles(prev => prev.filter((_, i) => i !== index));
      setBeforeImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      URL.revokeObjectURL(afterImagePreviews[index]);
      setAfterImageFiles(prev => prev.filter((_, i) => i !== index));
      setAfterImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile) {
      setError('Professional profile not found');
      return;
    }

    if (services.length === 0) {
      setError('Please add at least one service');
      return;
    }

    if (aftercareInstructions.length === 0) {
      setError('Please add aftercare instructions');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const summary: Omit<AftercareSummary, 'id' | 'status'> = {
        clientId,
        professionalId: userProfile.id,
        date: new Date().toISOString(),
        beforeImages: [],
        afterImages: [],
        services,
        recommendedProducts,
        aftercareInstructions,
        notes,
        reviewSubmitted: false,
        productsOrdered: [],
        nextAppointmentBooked: false
      };

      const summaryId = await createAftercareSummary(summary, beforeImageFiles, afterImageFiles);
      onSave(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create summary');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Services Section */}
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Services Provided</h3>
          {services.map((service, index) => (
            <div key={index} className="flex items-center space-x-4 mb-4">
              <input
                type="text"
                value={service.name}
                onChange={(e) => {
                  const updatedServices = [...services];
                  updatedServices[index].name = e.target.value;
                  setServices(updatedServices);
                }}
                className="flex-1 rounded-md border-gray-300"
                placeholder="Service name"
              />
              <input
                type="number"
                value={service.price}
                onChange={(e) => {
                  const updatedServices = [...services];
                  updatedServices[index].price = parseFloat(e.target.value);
                  setServices(updatedServices);
                }}
                className="w-32 rounded-md border-gray-300"
                placeholder="Price"
              />
              <button
                type="button"
                onClick={() => setServices(services.filter((_, i) => i !== index))}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setServices([...services, { id: Date.now().toString(), name: '', price: 0, nextAppointmentRecommendation: { timeframe: 4, reason: '' } }])}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </button>
        </section>

        {/* Before & After Images */}
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Before & After Images</h3>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Before</h4>
              <div className="grid grid-cols-2 gap-4">
                {beforeImagePreviews.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <img src={url} alt={`Before ${index + 1}`} className="rounded-lg object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => removeImage('before', index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageUpload('before', e.target.files)}
                  />
                  <Camera className="h-8 w-8 text-gray-400" />
                </label>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">After</h4>
              <div className="grid grid-cols-2 gap-4">
                {afterImagePreviews.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <img src={url} alt={`After ${index + 1}`} className="rounded-lg object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => removeImage('after', index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageUpload('after', e.target.files)}
                  />
                  <Camera className="h-8 w-8 text-gray-400" />
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Recommended Products */}
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recommended Products</h3>
          {recommendedProducts.map((product, index) => (
            <div key={index} className="flex items-start space-x-4 mb-4">
              <div className="flex-shrink-0">
                <img src={product.image} alt={product.name} className="w-20 h-20 rounded-lg object-cover" />
              </div>
              <div className="flex-grow">
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => {
                    const updatedProducts = [...recommendedProducts];
                    updatedProducts[index].name = e.target.value;
                    setRecommendedProducts(updatedProducts);
                  }}
                  className="w-full rounded-md border-gray-300 mb-2"
                  placeholder="Product name"
                />
                <textarea
                  value={product.usage}
                  onChange={(e) => {
                    const updatedProducts = [...recommendedProducts];
                    updatedProducts[index].usage = e.target.value;
                    setRecommendedProducts(updatedProducts);
                  }}
                  className="w-full rounded-md border-gray-300"
                  placeholder="Usage instructions"
                  rows={2}
                />
              </div>
              <div className="flex-shrink-0">
                <input
                  type="number"
                  value={product.price}
                  onChange={(e) => {
                    const updatedProducts = [...recommendedProducts];
                    updatedProducts[index].price = parseFloat(e.target.value);
                    setRecommendedProducts(updatedProducts);
                  }}
                  className="w-32 rounded-md border-gray-300 mb-2"
                  placeholder="Price"
                />
                <button
                  type="button"
                  onClick={() => setRecommendedProducts(recommendedProducts.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setRecommendedProducts([...recommendedProducts, {
              id: Date.now().toString(),
              name: '',
              description: '',
              price: 0,
              image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop',
              usage: '',
              inStock: true
            }])}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </section>

        {/* Aftercare Instructions */}
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Aftercare Instructions</h3>
          {aftercareInstructions.map((instruction, index) => (
            <div key={index} className="flex items-center space-x-4 mb-4">
              <input
                type="text"
                value={instruction}
                onChange={(e) => {
                  const updatedInstructions = [...aftercareInstructions];
                  updatedInstructions[index] = e.target.value;
                  setAftercareInstructions(updatedInstructions);
                }}
                className="flex-1 rounded-md border-gray-300"
                placeholder="Add instruction"
              />
              <button
                type="button"
                onClick={() => setAftercareInstructions(aftercareInstructions.filter((_, i) => i !== index))}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setAftercareInstructions([...aftercareInstructions, ''])}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Instruction
          </button>
        </section>

        {/* Additional Notes */}
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-md border-gray-300"
            rows={4}
            placeholder="Add any additional notes or special instructions..."
          />
        </section>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit" 
            disabled={isSubmitting}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting 
                ? 'bg-indigo-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Summary
          </button>
        </div>
      </form>
    </div>
  );
};
