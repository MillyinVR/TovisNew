import { useState, useEffect } from 'react';
import { TrendingCategory, TrendingVideo } from '../types/discovery';

const mockCategories: TrendingCategory[] = [
  {
    id: 1,
    name: 'Nails',
    trend: 'Glazed Donut Nails',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&h=500&fit=crop'
  },
  {
    id: 2,
    name: 'Hair',
    trend: 'Wolf Cut',
    image: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=500&h=500&fit=crop'
  },
  {
    id: 3,
    name: 'Makeup',
    trend: 'Siren Eyes',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&h=500&fit=crop'
  },
  {
    id: 4,
    name: 'Facials',
    trend: 'Gua Sha Massage',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&h=500&fit=crop'
  }
];

const mockVideos: TrendingVideo[] = [
  {
    id: 1,
    title: 'Perfect Glazed Donut Nails',
    likes: '1.2K',
    views: '5.7K',
    hashtags: ['#nails', '#glazeddonut'],
    service: 'Glazed Donut Nails',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-decorating-nails-with-glitter-48969-large.mp4'
  },
  {
    id: 2,
    title: 'Easy Wolf Cut Tutorial',
    likes: '890',
    views: '3.2K',
    hashtags: ['#wolfcut', '#hairstyle'],
    service: 'Wolf Cut',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-having-her-hair-cut-50199-large.mp4'
  },
  {
    id: 3,
    title: 'Siren Eyes Makeup Look',
    likes: '2.1K',
    views: '8.9K',
    hashtags: ['#sireneyes', '#makeup'],
    service: 'Siren Eyes',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-applying-makeup-on-her-eyes-48044-large.mp4'
  }
];

export const useTrendingData = () => {
  const [categories, setCategories] = useState<TrendingCategory[]>([]);
  const [videos, setVideos] = useState<TrendingVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      setCategories(mockCategories);
      setVideos(mockVideos);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return { categories, videos, loading };
};