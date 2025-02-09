import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ProfessionalCard } from './DiscoveryLayout';
import { useDiscoveryData } from '../../hooks/useDiscoveryData';
import { FooterNav } from '../shared/FooterNav';
import { useAuth } from '../../contexts/AuthContext';
import { ServiceCategory } from '../../types/service';

const ProfessionalsList = () => {
  const { categoryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { categories } = useDiscoveryData();
  const { userProfile } = useAuth();
  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        // Try to get category from location state first
        if (location.state?.category) {
          setCategory(location.state.category);
          return;
        }

        // Fallback to finding category in categories list
        const foundCategory = categories.find(c => c.id === categoryId);
        if (foundCategory) {
          setCategory(foundCategory);
        } else {
          throw new Error('Category not found');
        }
      } catch (error) {
        console.error('Error fetching category:', error);
        navigate('/discovery');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId, categories, location.state, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <FooterNav userType={userProfile?.role === 'professional' ? 'professional' : 'client'} />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Category not found</p>
            <button
              onClick={() => navigate('/discovery')}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Back to Discovery
            </button>
          </div>
        </div>
        <FooterNav userType={userProfile?.role === 'professional' ? 'professional' : 'client'} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <button
            onClick={() => navigate('/discovery')}
            className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Categories
          </button>

          <h2 className="text-2xl font-bold text-gray-900">
            Professionals for {category.name}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {category.professionals?.length > 0 ? (
              category.professionals.map((professional) => (
                <ProfessionalCard key={professional.id} professional={professional} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No professionals available for this category</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <FooterNav userType={userProfile?.role === 'professional' ? 'professional' : 'client'} />
    </div>
  );
};

export default ProfessionalsList;
