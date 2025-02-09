import React from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DiscoveryHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const DiscoveryHeader: React.FC<DiscoveryHeaderProps> = ({ searchTerm, onSearchChange }) => {
  const { logout } = useAuth();
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
          <div className="flex items-center gap-4">
            <div className="relative w-96">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search trends, services, professionals..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
            <button
              onClick={logout}
              className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
