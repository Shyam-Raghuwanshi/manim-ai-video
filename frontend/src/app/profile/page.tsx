'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FaUser, FaSpinner, FaSave } from 'react-icons/fa';
import { useAuth } from '@/lib/auth-context';
import { authAPI } from '@/lib/api';

type FormData = {
  name: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Set initial form values from user data
  useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
    }
  }, [user, setValue]);
  
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await authAPI.updateProfile(data);
      setSuccessMessage('Profile updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
      console.error('Profile update error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-blue-900 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Your Profile</h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl text-balck font-semibold mb-6">Account Information</h2>
            
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                <p>{successMessage}</p>
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                <p>{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-black font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-black"
                  value={user?.email || ''}
                  disabled
                />
                <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    className={`w-full pl-10 pr-3 py-2  text-black border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                    }`}
                    placeholder="Enter your name"
                    {...register('name', { required: 'Name is required' })}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Subscription Tier</label>
                <div className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-between">
                  <span className="font-medium capitalize">{user?.subscription_tier || 'Free'}</span>
                  <a href="/pricing" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Upgrade Plan
                  </a>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between items-center space-y-4 sm:space-y-0">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center justify-center px-6 py-3 rounded-lg text-white font-medium ${
                    isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={logout}
                  className="px-6 py-3 border border-red-500 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            </form>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-8 mt-8">
            <h2 className="text-2xl font-semibold text-red-600 mb-6">Danger Zone</h2>
            
            <div className="border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2">Delete Account</h3>
              <p className="text-gray-600 mb-4">
                Once you delete your account, all of your data and videos will be permanently removed.
                This action cannot be undone.
              </p>
              <button
                type="button"
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}