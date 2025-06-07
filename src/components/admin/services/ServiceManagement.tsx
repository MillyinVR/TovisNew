import { useState, useEffect } from 'react';
import { Edit2, Trash2, X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FileUpload } from '../../shared/FileUpload';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { serviceApi } from '../../../lib/api/services';
import { Timestamp } from 'firebase/firestore';
import type { AdminService, ServiceCategory } from '../../../types/service';
import { toast } from 'react-toastify';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';
import { useAdminServiceManagement } from '../../../hooks/useAdminServiceManagement';

interface FormValues {
  serviceName: string;
  description: string;
  basePrice: number;
  categoryId: string;
}

const serviceSchema = yup.object({
  serviceName: yup.string().required('Service name is required'),
  description: yup.string().required('Description is required'),
  basePrice: yup.number()
    .required('Base price is required')
    .min(0, 'Price must be positive'),
  categoryId: yup.string().required('Category is required')
});

const categorySchema = yup.object({
  name: yup.string().required('Category name is required'),
  imageUrl: yup.string().url('Invalid image URL').required('Image is required')
});

export const ServiceManagement = () => {
  const { 
    categories: initialCategories,
    services: initialServices,
    loading: initialLoading
  } = useAdminServiceManagement();

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
    resolver: yupResolver(serviceSchema)
  });

  const { 
    register: registerCategory,
    handleSubmit: handleSubmitCategory,
    reset: resetCategory,
    formState: { errors: errorsCategory }
  } = useForm({
    resolver: yupResolver(categorySchema)
  });

  const storage = getStorage();

  const handleCategoryImageUpload = async (file: File) => {
    try {
      const storageRef = ref(storage, `categories/${file.name}`);
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

  const handleCreateCategory = async (data: { name: string }) => {
    try {
      setLoadingCategory(true);
      if (!categoryImage) {
        toast.error('Category image is required');
        return;
      }

      const newCategory = {
        name: data.name,
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

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      
      if (serviceImages.length === 0) {
        toast.error('At least one service image is required');
        return;
      }

      const serviceData: Omit<AdminService, 'id' | 'createdAt' | 'updatedAt'> = {
        name: data.serviceName,
        description: data.description,
        categoryId: data.categoryId,
        price: Number(data.basePrice),
        duration: 60, // Default duration
        totalBookings: 0,
        revenue: 0,
        rating: 0,
        status: 'active',
        isPublished: true,
        media: serviceImages.map(url => ({ url, type: 'image' as const })),
        professionalId: '',
        availability: undefined
      };

      if (selectedService) {
        await serviceApi.admin.updateService(selectedService.id, serviceData);
        setServices(prev => prev.map(s => 
          s.id === selectedService.id ? { ...s, ...serviceData } : s
        ));
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
      toast.error('Failed to save service');
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

  useEffect(() => {
    if (initialCategories) setCategories(initialCategories);
    if (initialServices) setServices(initialServices);
  }, [initialCategories, initialServices]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Services</h2>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Category Management */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Manage Categories</h3>
          
          <form onSubmit={handleSubmitCategory(handleCreateCategory)} className="space-y-4">
            <div className="space-y-2">
              <div className="font-medium">Category Name</div>
              <Input
                {...registerCategory('name')}
                placeholder="Enter category name"
              />
              {errorsCategory.name && (
                <p className="text-sm text-red-500">{errorsCategory.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="font-medium">Category Image</div>
              <FileUpload
                onFileUpload={handleCategoryImageUpload}
                accept="image/*"
              />
              {errorsCategory.imageUrl && (
                <p className="text-sm text-red-500">{errorsCategory.imageUrl.message}</p>
              )}
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
              <div className="font-medium">Service Name</div>
              <Input
                {...register('serviceName')}
                placeholder="Enter service name"
              />
              {errors.serviceName && (
                <p className="text-sm text-red-500">{errors.serviceName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="font-medium">Description</div>
              <Input
                {...register('description')}
                placeholder="Enter description"
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="font-medium">Base Price ($)</div>
              <Input
                type="number"
                {...register('basePrice')}
              />
              {errors.basePrice && (
                <p className="text-sm text-red-500">{errors.basePrice.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="font-medium">Category</div>
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
              <div className="font-medium">Service Images</div>
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
                        categoryId: service.categoryId
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
