import React, { useState } from 'react';
import { X, Camera, Upload, Search, Clock } from 'lucide-react';
import BeautyCapture from '../../../shared/BeautyCapture';

interface Service {
  id: string;
  name: string;
  rebookingPeriod?: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface AftercareSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  todayClients: Array<{
    id: string;
    name: string;
    services: Service[];
    beforeImage?: string;
  }>;
}

export const AftercareSummaryModal: React.FC<AftercareSummaryModalProps> = ({
  isOpen,
  onClose,
  todayClients
}) => {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  // Mock products data
  const products: Product[] = [
    {
      id: '1',
      name: 'Hair Treatment Serum',
      description: 'Professional strength hair repair treatment',
      price: 29.99,
      image: '/product1.jpg'
    },
    {
      id: '2',
      name: 'Styling Cream',
      description: 'Medium hold styling cream for all hair types',
      price: 24.99,
      image: '/product2.jpg'
    }
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCaptureImage = (imageData: string) => {
    setAfterImage(imageData);
    setShowCamera(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAfterImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const client = todayClients.find(c => c.id === selectedClient);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <h3 className="text-2xl font-medium text-gray-900">Aftercare Summary</h3>
              <button
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Client Selection */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">Select Client</label>
              <select
                value={selectedClient || ''}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select a client</option>
                {todayClients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            {selectedClient && (
              <>
                {/* Before/After Images */}
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900">Service Images</h4>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="aspect-w-1 aspect-h-1 relative">
                      <img
                        src={client?.beforeImage}
                        alt="Before"
                        className="rounded-lg object-cover"
                      />
                      <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 text-sm text-white rounded">
                        Before
                      </span>
                    </div>
                    <div className="aspect-w-1 aspect-h-1 relative">
                      {afterImage ? (
                        <img
                          src={afterImage}
                          alt="After"
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <button
                            onClick={() => setShowCamera(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          >
                            <Camera className="h-5 w-5" />
                            Take Photo
                          </button>
                          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer">
                            <Upload className="h-5 w-5" />
                            Upload Photo
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileUpload}
                            />
                          </label>
                        </div>
                      )}
                      <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 text-sm text-white rounded">
                        After
                      </span>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900">Services</h4>
                  <div className="mt-2 space-y-4">
                    {client?.services.map(service => (
                      <div key={service.id} className="flex items-center justify-between border rounded-lg p-4">
                        <span className="text-gray-900">{service.name}</span>
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-gray-400" />
                          <select
                            value={service.rebookingPeriod || ''}
                            onChange={(e) => {
                              // Handle rebooking period change
                            }}
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          >
                            <option value="">Rebook in...</option>
                            <option value="2">2 weeks</option>
                            <option value="4">4 weeks</option>
                            <option value="6">6 weeks</option>
                            <option value="8">8 weeks</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Products */}
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900">Recommended Products</h4>
                  <div className="mt-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {filteredProducts.map(product => (
                        <div
                          key={product.id}
                          className="flex items-center gap-4 border rounded-lg p-4"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{product.name}</h5>
                            <p className="text-sm text-gray-500">{product.description}</p>
                            <p className="mt-1 text-sm font-medium text-gray-900">${product.price}</p>
                          </div>
                          <button
                            onClick={() => {
                              if (selectedProducts.find(p => p.id === product.id)) {
                                setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
                              } else {
                                setSelectedProducts([...selectedProducts, product]);
                              }
                            }}
                            className={`px-3 py-1 rounded-md ${
                              selectedProducts.find(p => p.id === product.id)
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {selectedProducts.find(p => p.id === product.id) ? 'Added' : 'Add'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Close
            </button>
            {selectedClient && (
              <button
                type="button"
                onClick={() => {
                  // Handle save
                  onClose();
                }}
                className="ml-3 inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Save Summary
              </button>
            )}
          </div>
        </div>
      </div>

      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black">
          <BeautyCapture onCapture={handleCaptureImage} onClose={() => setShowCamera(false)} />
        </div>
      )}
    </div>
  );
};
