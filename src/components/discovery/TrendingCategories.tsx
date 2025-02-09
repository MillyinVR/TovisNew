import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingCategory } from '../../types/discovery';

interface TrendingCategoriesProps {
  categories: TrendingCategory[];
}

export const TrendingCategories: React.FC<TrendingCategoriesProps> = ({ categories }) => {
  const navigate = useNavigate();

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Trending Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => navigate(`/discover/category/${category.id}`)}
            className="relative h-48 rounded-lg overflow-hidden shadow-md cursor-pointer group"
          >
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
              <h3 className="text-white text-lg font-semibold">{category.name}</h3>
              <p className="text-white/80 text-sm">Trending: {category.trend}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};