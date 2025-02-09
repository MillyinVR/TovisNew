export interface TrendingCategory {
  id: number;
  name: string;
  trend: string;
  image: string;
}

export interface TrendingVideo {
  id: number;
  title: string;
  likes: string;
  views: string;
  hashtags: string[];
  service: string;
  videoUrl: string;
}

export interface Professional {
  id: number;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  socialMedia: {
    tiktok: string;
    instagram: string;
  };
  services: Array<{
    name: string;
    price: string;
  }>;
  portfolio: Array<{
    id: number;
    type: 'image' | 'video';
    url: string;
    description: string;
  }>;
  location: string;
}