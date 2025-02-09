import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthHeader } from './shared/AuthHeader';
import { Menu, X } from 'lucide-react';

interface AuthFormProps {
  isLogin?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({ isLogin = true }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'professional'>('client');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    console.log('AuthForm - Form submission:', {
      isLogin,
      email,
      role,
      roleType: typeof role,
      isProfessional: role === 'professional'
    });

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        console.log('AuthForm - Calling signUp with role:', role);
        await signUp(email, password, role);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    setError(null);
    setLoading(true);

    try {
      let demoEmail;
      switch (role) {
        case 'admin':
          demoEmail = 'admin@test.com';
          break;
        case 'professional':
          demoEmail = 'professional@test.com';
          break;
        case 'client':
          demoEmail = 'client@test.com';
          break;
        default:
          throw new Error('Invalid role');
      }

      await signIn(demoEmail, 'Password@1');
    } catch (err) {
      console.error('Demo login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during demo login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Slide-out Menu */}
      <div className={`fixed inset-0 z-[100] ${isMenuOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Menu Panel */}
        <div className={`absolute top-0 left-0 w-[280px] sm:w-96 h-full bg-white transform transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="px-4 py-3 flex justify-between items-center border-b">
            <h2 className="text-xl font-semibold">Menu</h2>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Menu content */}
        </div>
      </div>

      {/* Header */}
      <div className="relative z-[90]">
        <AuthHeader onMenuClick={() => setIsMenuOpen(true)} />
      </div>

      {/* Main Content */}
      <div className="relative z-[80] min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? 'Sign in to continue to your account' : 'Join our community of beauty professionals and clients'}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    I want to
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        console.log('Setting role to client');
                        setRole('client');
                      }}
                      aria-pressed={role === 'client'}
                      className={`flex items-center justify-center px-4 py-2 border ${
                        role === 'client'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-300 bg-white text-gray-700'
                      } rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                      Book Services
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        console.log('Setting role to professional');
                        setRole('professional');
                      }}
                      aria-pressed={role === 'professional'}
                      className={`flex items-center justify-center px-4 py-2 border ${
                        role === 'professional'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-300 bg-white text-gray-700'
                      } rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                      Offer Services
                    </button>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : isLogin ? 'Sign in' : 'Sign up'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    {isLogin ? 'New to the platform?' : 'Already have an account?'}
                    {!isLogin && role === 'professional' && (
                      <span className="block mt-1 text-xs">
                        You'll need to complete verification after signing up
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => navigate(isLogin ? '/signup' : '/login')}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  {isLogin ? 'Create an account' : 'Sign in instead'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};