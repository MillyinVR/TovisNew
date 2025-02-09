import { useState, useEffect } from 'react';
import { Edit2, Trash2, X, Loader2, Plus, Search, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FileUpload } from '../../shared/FileUpload';
import { uploadBytes, getDownloadURL, ref } from 'firebase/storage';
import { serviceApi } from '../../../lib/api/services';
import { Timestamp } from 'firebase/firestore';
import { categoryImagesRef, auth, storage } from '../../../lib/firebase';
import type { AdminService, ServiceCategory } from '../../../types/service';
import { toast } from 'react-toastify';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { useAdminServiceManagement } from '../../../hooks/useAdminServiceManagement';

interface FormValues {
  serviceName: string;
  description: string;
  basePrice: number;
  price: number;
  minPrice: number;
  priceStep: number;
  baseDuration: number;
  duration: number;
  minDuration: number;
  durationStep: number;
  categoryId: string;
  subcategoryId?: string;
  active: boolean;
  isActive: boolean;
  isPriceValid: boolean;
  isDurationValid: boolean;
  professionalPrice: number;
  professionalDuration: number;
  rating: number;
  reviewCount: number;
  professionalId: string;
}

const serviceSchema = yup.object({
  serviceName: yup.string().required('Service name is required'),
  description: yup.string().required('Description is required'),
  basePrice: yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('Base price is required')
    .min(0, 'Price must be positive'),
  minPrice: yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(0, 'Minimum price must be positive')
    .default(0),
  priceStep: yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(0, 'Increment must be positive')
    .default(0),
  baseDuration: yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('Base duration is required')
    .min(15, 'Minimum base duration is 15 minutes'),
  minDuration: yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(15, 'Minimum duration is 15 minutes')
    .default(15),
  durationStep: yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(0, 'Increment must be positive')
    .default(0),
  categoryId: yup.string().required('Category is required'),
  subcategoryId: yup.string().optional(),
  active: yup.boolean().default(true),
  isActive: yup.boolean().default(true),
  isPriceValid: yup.boolean().default(true),
  isDurationValid: yup.boolean().default(true),
  professionalPrice: yup.number().default(0),
  professionalDuration: yup.number().default(0),
  rating: yup.number().default(0),
  reviewCount: yup.number().default(0),
  professionalId: yup.string().default('')
});

const categorySchema = yup.object({
  name: yup.string().required('Category name is required'),
  description: yup.string().nullable()
});

export const ServiceManagement = () => {
  const {
    categories: initialCategories,
    services: initialServices,
    loading: initialLoading,
    error: initialError
  } = useAdminServiceManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'category' | 'service'>('category');
  const [categories, setCategories] = useState<ServiceCategory[]>(initialCategories || []);
  const [services, setServices] = useState<AdminService[]>(initialServices || []);
  const [loading, setLoading] = useState(initialLoading);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [selectedService, setSelectedService] = useState<AdminService | null>(null);
  const [categoryImage, setCategoryImage] = useState<string | null>(null);
  const [serviceImages, setServiceImages] = useState<string[]>([]);

  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm<FormValues>({
    resolver: yupResolver(serviceSchema) as any,
    defaultValues: {
      minPrice: 0,
      priceStep: 10,
      minDuration: 15,
      durationStep: 15,
      active: true,
      isActive: true,
      isPriceValid: true,
      isDurationValid: true,
      professionalPrice: 0,
      professionalDuration: 0,
      rating: 0,
      reviewCount: 0,
      professionalId: ''
    }
  });

  const { 
    register: registerCategory,
    handleSubmit: handleSubmitCategory,
    reset: resetCategory,
    formState: { errors: errorsCategory }
  } = useForm<{ name: string; description?: string }>({
    resolver: yupResolver(categorySchema) as any
  });

  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCategoryImageUpload = async (file: File) => {
    try {
      if (!auth.currentUser) {
        throw new Error('User must be authenticated to upload images');
      }
      const storageRef = categoryImagesRef(file.name);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setCategoryImage(downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Failed to upload category image:', error);
      toast.error('Failed to upload image');
      throw error;
    }
  };

  const handleServiceImageUpload = async (file: File) => {
    try {
      if (!auth.currentUser) {
        throw new Error('User must be authenticated to upload images');
      }
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name}`;
      const storageRef = ref(storage, `services/${filename}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setServiceImages(prev => [...prev, downloadURL]);
      return downloadURL;
    } catch (error) {
      console.error('Failed to upload service image:', error);
      toast.error('Failed to upload image');
      throw error;
    }
  };

  const handleCreateCategory = async (data: { name: string; description?: string }) => {
    try {
      setLoadingCategory(true);
      if (!categoryImage) {
        toast.error('Category image is required');
        return;
      }

      const newCategory: Omit<ServiceCategory, 'id' | 'createdAt' | 'updatedAt'> = {
        name: data.name,
        description: data.description,
        imageUrl: categoryImage,
        services: []
      };

      const categoryId = await serviceApi.admin.createCategory(newCategory);

      setCategories(prev => [...prev, {
        ...newCategory,
        id: categoryId,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      }]);

      resetCategory();
      setCategoryImage(null);
      toast.success('Category created successfully');
    } catch (error) {
      console.error('Failed to create category:', error);
      toast.error('Failed to create category');
    } finally {
      setLoadingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      setLoadingCategory(true);
      await serviceApi.admin.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    } finally {
      setLoadingCategory(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categories = await serviceApi.getCategories();
      setCategories(categories);
      
      // Load services for each category
      const allServices = await Promise.all(
        categories.map(async category => {
          const services = await serviceApi.admin.getServices({ category: category.id });
          return services;
        })
      );
      setServices(allServices.flat());
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load categories and services');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      
      // Ensure we have at least one image
      if (serviceImages.length === 0) {
        toast.error('At least one service image is required');
        return;
      }

      // Validate required fields
      if (!data.serviceName?.trim()) {
        toast.error('Service name is required');
        return;
      }
      if (!data.description?.trim()) {
        toast.error('Service description is required');
        return;
      }
      if (!data.categoryId) {
        toast.error('Category is required');
        return;
      }
      if (!data.basePrice || data.basePrice <= 0) {
        toast.error('Base price must be greater than 0');
        return;
      }
      if (!data.baseDuration || data.baseDuration < 15) {
        toast.error('Base duration must be at least 15 minutes');
        return;
      }

      // Log form data for debugging
      console.log('Form data:', data);
      console.log('Service images:', serviceImages);

      // Map form data to match AdminService interface
      const serviceData: Omit<AdminService, 'id' | 'createdAt' | 'updatedAt'> = {
        name: data.serviceName?.trim() || '',
        description: data.description.trim(),
        categoryId: data.categoryId,
        duration: Number(data.baseDuration),
        price: Number(data.basePrice),
        status: 'active',
        isPublished: true,
        media: serviceImages.map(url => ({
          url,
          type: 'image'
        })),
        totalBookings: 0,
        revenue: 0,
        rating: 0,
        professionalId: undefined
      };

      if (selectedService) {
        await serviceApi.admin.updateService(selectedService.id, serviceData);
        const updatedServices = services.map(s => 
          s.id === selectedService.id ? { ...s, ...serviceData } : s
        );
        setServices(updatedServices);
        toast.success('Service updated successfully');
      } else {
        const newService = await serviceApi.admin.createService(serviceData);
        setServices(prev => [...prev, newService]);
        toast.success('Service created successfully');
      }
      
      reset();
      setSelectedService(null);
      setServiceImages([]);
    } catch (error) {
      console.error('Service operation failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (service: AdminService) => {
    try {
      await serviceApi.admin.deleteService(service.id);
      setServices(prev => prev.filter(s => s.id !== service.id));
      toast.success('Service deleted successfully');
    } catch (error) {
      console.error('Failed to delete service:', error);
      toast.error('Failed to delete service');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Services</h2>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Category Management */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Manage Categories</h3>
          
          <form onSubmit={handleSubmitCategory(handleCreateCategory)} className="space-y-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input
                {...registerCategory('name')}
                placeholder="Enter category name"
              />
              {errorsCategory.name && (
                <p className="text-sm text-red-500">{errorsCategory.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                {...registerCategory('description')}
                placeholder="Enter description"
              />
            </div>

            <div className="space-y-2">
              <Label>Category Image</Label>
              <FileUpload
                onFileUpload={handleCategoryImageUpload}
                accept="image/*"
              />
            </div>

            <Button type="submit" disabled={loadingCategory}>
              {loadingCategory ? <Loader2 className="animate-spin" /> : 'Create Category'}
            </Button>
          </form>

          <div className="mt-6 space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  {category.imageUrl && (
                    <img 
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  <span>{category.name}</span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Service Management */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Manage Services</h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Service Name</Label>
              <Input
                {...register('serviceName')}
                placeholder="Enter service name"
              />
              {errors.serviceName && (
                <p className="text-sm text-red-500">{errors.serviceName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                {...register('description')}
                placeholder="Enter description"
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Base Price ($)</Label>
                <Input
                  type="number"
                  {...register('basePrice')}
                />
                {errors.basePrice && (
                  <p className="text-sm text-red-500">{errors.basePrice.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Base Duration (mins)</Label>
                <Input
                  type="number"
                  {...register('baseDuration')}
                />
                {errors.baseDuration && (
                  <p className="text-sm text-red-500">{errors.baseDuration.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <select
                {...register('categoryId')}
                className="w-full p-2 border rounded"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-sm text-red-500">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Service Images</Label>
              <FileUpload
                multiple
                onFileUpload={handleServiceImageUpload}
                accept="image/*"
              />
              {serviceImages.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {serviceImages.map((url, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={url} 
                        alt={`Service image ${index + 1}`}
                        className="w-16 h-16 rounded object-cover"
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        onClick={() => setServiceImages(prev => prev.filter((_, i) => i !== index))}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Save Service'}
              </Button>
              {selectedService && (
                <Button variant="outline" onClick={() => setSelectedService(null)}>
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Services List</h3>
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {service.media?.[0] && (
                    <img 
                      src={service.media[0].url}
                      alt={service.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold">{service.name}</h4>
                    <p className="text-sm text-gray-600">{service.description}</p>
                    <div className="flex gap-4 mt-1 text-sm">
                      <span>${service.price}</span>
                      <span>{service.duration} mins</span>
                      <span className="text-blue-600">
                        {categories.find(c => c.id === service.categoryId)?.name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedService(service);
                      setServiceImages(service.media?.map(m => m.url) || []);
                      reset({
                        serviceName: service.name,
                        description: service.description,
                        basePrice: service.price,
                        price: service.price,
                        minPrice: service.price,
                        priceStep: 10,
                        baseDuration: service.duration,
                        duration: service.duration,
                        minDuration: service.duration,
                        durationStep: 15,
                        categoryId: service.categoryId,
                        active: service.status === 'active',
                        isActive: service.status === 'active',
                        isPriceValid: true,
                        isDurationValid: true,
                        professionalPrice: 0,
                        professionalDuration: 0,
                        rating: service.rating,
                        reviewCount: 0,
                        professionalId: service.professionalId || ''
                      });
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteService(service)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
