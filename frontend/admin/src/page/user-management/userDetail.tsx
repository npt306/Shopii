// UserProfileModal.tsx
import React, { useState } from 'react';

interface UserDetail {
  AccountId: number;
  Email: string;
  Username: string;
  Avatar?: string | null;
  DoB: string;
  PhoneNumber: string;
  Sex: boolean;
  Status: 'active' | 'inactive' | 'pending' | string;
  CreatedAt: string;
  UpdatedAt: string;
  seller?: {
    id: number;
    ShopName: string;
    TaxCode: number;
    SellerType: string;
    Email: string[];
    Followers: number;
    CreatedAt: string;
    UpdatedAt: string;
  };
  address?: {
    AddressId: number;
    Fullname: string;
    PhoneNumber: string;
    Province: string;
    District: string;
    Ward: string;
    SpecificAddress: string;
    CreatedAt: string;
    UpdatedAt: string;
    AccountId: number;
    IsDefault: boolean;
  };
}

interface UserProfileModalProps {
  user: UserDetail;
  onClose: () => void;
  onUserUpdated?: () => void; // Callback to refresh user list after update
}

const UserDetails: React.FC<UserProfileModalProps> = ({ user, onClose, onUserUpdated }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBanConfirm, setShowBanConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUserBanned = user.Status === 'inactive';

  const handleDeleteAccount = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/accounts/${user.AccountId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }
      
      if (onUserUpdated) onUserUpdated();
      onClose();
    } catch (error) {
      console.error('Failed to delete account:', error);
      setError('Failed to delete account. Please try again later.');
    } finally {
      setIsProcessing(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleToggleBan = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const newStatus = isUserBanned ? 'active' : 'inactive';
      const response = await fetch(`/api/accounts/${user.AccountId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${user.Status === 'inactive' ? 'unban' : 'ban'} user`);
      }

      user.Status = newStatus;

      if (onUserUpdated) onUserUpdated();
      onClose();
    } catch (error) {
      console.error('Failed to update user status:', error);
      setError(`Failed to ${isUserBanned ? 'unban' : 'ban'} user. Please try again later.`);
    } finally {
      setIsProcessing(false);
      setShowBanConfirm(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      {/* Header with back button */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <button 
          onClick={onClose}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to User List
        </button>
        <h1 className="text-2xl font-bold">User Profile: {user.Username}</h1>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* User profile content in a card layout */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Profile header with key actions */}
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xl font-medium text-gray-900">{user.Username}</div>
              <div className="text-sm text-gray-500">{user.Email}</div>
              <span
                className={`
                  mt-2 inline-block px-2 py-1 rounded text-xs 
                  ${user.Status === 'active' ? 'bg-green-100 text-green-800' : 
                    user.Status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}
                `}
              >
                {user.Status}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setShowBanConfirm(true)}
                className={`px-3 py-2 rounded-md text-white ${
                  isUserBanned 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
                disabled={isProcessing}
              >
                {isUserBanned ? 'Unban User' : 'Ban User'}
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                disabled={isProcessing}
              >
                Delete Account
              </button>
            </div>
          </div>
          
          {/* Grid layout for user information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Account Information */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-3">Account Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account ID</label>
                  <p className="mt-1">{user.AccountId}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <p className="mt-1">{user.Username}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1">{user.Email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="mt-1">{new Date(user.DoB).toLocaleDateString()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <p className="mt-1">{user.PhoneNumber}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                  <p className="mt-1">{new Date(user.CreatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            {/* Address Information (if exists) */}
            {user.address && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-lg mb-3">Address Information</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1">{user.address.Fullname}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <p className="mt-1">{user.address.PhoneNumber}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="mt-1">
                      {user.address.SpecificAddress}, {user.address.Ward}, {user.address.District}, {user.address.Province}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Default Address</label>
                    <p className="mt-1">{user.address.IsDefault ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Seller Information (if exists) */}
          {user.seller && (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-3">Seller Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Shop Name</label>
                  <p className="mt-1">{user.seller.ShopName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Seller Type</label>
                  <p className="mt-1">{user.seller.SellerType}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tax Code</label>
                  <p className="mt-1">{user.seller.TaxCode}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Followers</label>
                  <p className="mt-1">{user.seller.Followers}</p>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Seller Email(s)</label>
                  <p className="mt-1">{user.seller.Email.join(', ')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-4">
              Are you sure you want to delete the account for {user.Username}?
              This action cannot be undone and will permanently remove all user data.
            </p>
            
            <div className="mt-3 flex justify-end space-x-2">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-2 bg-gray-300 hover:bg-gray-400 rounded-md"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Confirmation Dialog */}
      {showBanConfirm && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-4">
              {isUserBanned ? 'Confirm Unbanning' : 'Confirm Banning'}
            </h3>
            <p className="mb-4">
              {isUserBanned
                ? 'Are you sure you want to unban this user? This will restore their access to the platform.'
                : 'Are you sure you want to ban this user? This will prevent them from accessing the platform.'}
            </p>
            
            <div className="mt-3 flex justify-end space-x-2">
              <button 
                onClick={() => setShowBanConfirm(false)}
                className="px-3 py-2 bg-gray-300 hover:bg-gray-400 rounded-md"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                onClick={handleToggleBan}
                className={`px-3 py-2 text-white rounded-md ${
                  isUserBanned 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
                disabled={isProcessing}
              >
                {isProcessing 
                  ? 'Processing...' 
                  : isUserBanned ? 'Confirm Unban' : 'Confirm Ban'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;
