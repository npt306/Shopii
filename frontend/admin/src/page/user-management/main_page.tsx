import React, { useState, useContext, useEffect } from 'react';
import UserDetails from './userDetail';
import '../../css/general.css';
import { Container } from 'react-bootstrap';
import User from './userInterface';

// Mapping of role-specific columns
const getRoleColumns = (role: 'buyer' | 'seller' | 'admin' | string) => {
  const baseColumns = [
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'Status', label: 'Status' }
  ];

  const roleSpecificColumns: Record<string, Array<{ key: string; label: string }>> = {
    buyer: [
      ...baseColumns,
    ],
    seller: [
      ...baseColumns,
    ],
    admin: [
      ...baseColumns,
    ]
  };

  return roleSpecificColumns[role] || baseColumns;
};


// Main User Management Component
export const UserManagement: React.FC = () => {
  const [activeRole, setActiveRole] = useState<string>('seller');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userCache, setUserCache] = useState<Record<string, User[]>>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToBan, setUserToBan] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [showBanConfirm, setShowBanConfirm] = useState<boolean>(false);

  // Roles the current user can access
  const accessibleRoles = ['buyer', 'seller', 'admin'];

  useEffect(() => {
    document.title = 'Quản lý Accounts';

    const fetchUsers = async () => {
      // If we already have data for this role in cache, use it
      if (userCache[activeRole]) {
        setUsers(userCache[activeRole]);
        setIsLoading(false);
        return;
      }

      // Otherwise fetch from API
      setIsLoading(true);
      try {
        const response = await fetch(`/api/accounts/role/${activeRole}`, {
          // `/api/vouchers/${id}`
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.log(response.statusText);
          throw new Error('Failed to fetch users');
        }

        const fetchedUsers = await response.json();

        // const response = await api.get(`/role/${activeRole}`);
        // const fetchedUsers = response.data;

        // Update the cache with the new data
        setUserCache(prevCache => ({
          ...prevCache,
          [activeRole]: fetchedUsers
        }));

        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Failed to fetch users', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [activeRole, userCache]);

  const handleViewProfile = async (userId: number) => {
    try {
      console.log(userId);
      const response = await fetch(`/api/accounts/${userId}/details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      
      const data = await response.json();
      console.log(data);
      setSelectedUser(data); // This data should match the UserDetail interface.
    } catch (error) {
      console.error('Failed to fetch user details', error);
    }
  };

  const handleToggleBanUser = (user: User) => {
    setUserToBan(user);
    setShowBanConfirm(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    if (!userToDelete) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/accounts/${userToDelete.AccountId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      // Update cache after successful deletion
      setUserCache(prevCache => {
        const updatedCache = { ...prevCache };
        Object.keys(updatedCache).forEach(role => {
          updatedCache[role] = updatedCache[role].filter(
            u => u.AccountId !== userToDelete.AccountId
          );
        });
        return updatedCache;
      });

      // Update current users list
      setUsers(prevUsers =>
        prevUsers.filter(u => u.AccountId !== userToDelete.AccountId)
      );

      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Failed to delete account:', error);
      setError('Failed to delete account. Please try again later.');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmToggleBan = async () => {
    if (!userToBan) return;

    setIsProcessing(true);
    setError(null);

    const newStatus = userToBan.Status === 'inactive' ? 'active' : 'inactive';

    try {
      const response = await fetch(`/api/accounts/${userToBan.AccountId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${userToBan.Status === 'inactive' ? 'unban' : 'ban'} user`);
      }

      // Update cache after successful status change
      setUserCache(prevCache => {
        const updatedCache = { ...prevCache };
        Object.keys(updatedCache).forEach(role => {
          updatedCache[role] = updatedCache[role].map(u =>
            u.AccountId === userToBan.AccountId ? { ...u, Status: newStatus } : u
          );
        });
        return updatedCache;
      });

      // Update current users list
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.AccountId === userToBan.AccountId ? { ...u, Status: newStatus } : u
        )
      );

      setShowBanConfirm(false);
      setUserToBan(null);
    } catch (error) {
      console.error('Failed to update user status:', error);
      setError(`Failed to ${userToBan.Status === 'inactive' ? 'unban' : 'ban'} user. Please try again later.`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Update UserProfileModal prop to include refresh callback
  const handleUserUpdated = () => {
    // Invalidate cache for the current role to force a refresh
    setUserCache(prevCache => {
      const newCache = { ...prevCache };
      delete newCache[activeRole];
      return newCache;
    });
  };

  return (
    <div className="mx-auto p-4">
      {selectedUser ? (
        // Full page user details
        <UserDetails
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUserUpdated={handleUserUpdated}
        />
      ) : (
        // Main user management table view
        <Container fluid className="shopee-page py-4">
          <div className="breadcrumb-placeholder mb-3">
            <h5 className="text-secondary">Trang chủ / Quản lý tài khoản</h5>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                {accessibleRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => setActiveRole(role)}
                    className={`
                    px-5 py-2.5 font-medium text-sm first:rounded-l-lg last:rounded-r-lg
                    border border-gray-200 
                    ${activeRole === role
                        ? 'bg-blue-600 text-white border-blue-600 z-10'
                        : 'bg-white text-gray-700 hover:bg-gray-50'}
                  `}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}s
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-3 text-gray-600">Loading users...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {getRoleColumns(activeRole).map(column => (
                          <th
                            key={column.key}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => console.log(`Sort by ${column.key}`)}
                          >
                            <div className="flex items-center">
                              {column.label}
                            </div>
                          </th>
                        ))}
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map(user => (
                        <tr key={user.AccountId} className="hover:bg-gray-50">
                          {getRoleColumns(activeRole).map(column => (
                            <td
                              key={column.key}
                              className="px-6 py-4 whitespace-nowrap text-sm"
                            >
                              {column.key === 'Status' ? (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.Status === 'active' ? 'bg-green-100 text-green-800' :
                                  user.Status === 'inactive' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                  {user.Status}
                                </span>
                              ) : column.key === 'roles' ? (
                                user.roles.join(', ')
                              ) : (
                                ((user as Record<string, any>)[column.key] || 'N/A')
                              )}
                            </td>
                          ))}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <button
                              onClick={() => handleViewProfile(user.AccountId)}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 mr-2"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                            <button
                              onClick={() => handleToggleBanUser(user)}
                              className={`inline-flex items-center px-3 py-1.5 rounded-md mr-2 ${user.Status === 'inactive'
                                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                }`}
                            >
                              {user.Status === 'inactive' ? (
                                <>
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  Unban
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                  </svg>
                                  Ban
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{users.length}</span> of <span className="font-medium">{users.length}</span> results
                  </div>
                  <div className="flex space-x-1">
                    <button className="px-3 py-1 border rounded-md bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                    <button className="px-3 py-1 border rounded-md bg-blue-600 text-white hover:bg-blue-700">1</button>
                    <button className="px-3 py-1 border rounded-md bg-white text-gray-700 hover:bg-gray-50">Next</button>
                  </div>
                </div>
              </>
            )}

            {/* Delete confirmation modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">Confirm User Deletion</h3>
                  <p className="text-center text-gray-600 mb-6">
                    Are you sure you want to delete the user{' '}
                    <span className="font-semibold">{userToDelete?.Username || 'Unknown'}</span>?
                    This action cannot be undone.
                  </p>
                  {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md font-medium"
                      disabled={isProcessing}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDeleteAccount}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium flex items-center"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Delete User'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Ban/Unban confirmation modal */}
            {showBanConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mx-auto mb-4">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      {userToBan?.Status === 'inactive' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      )}
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
                    {userToBan?.Status === 'inactive' ? 'Unban User' : 'Ban User'}
                  </h3>
                  <p className="text-center text-gray-600 mb-6">
                    Are you sure you want to {userToBan?.Status === 'inactive' ? 'unban' : 'ban'} the user{' '}
                    <span className="font-semibold">{userToBan?.Username || 'Unknown'}</span>?
                  </p>
                  {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setShowBanConfirm(false)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md font-medium"
                      disabled={isProcessing}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmToggleBan}
                      className={`px-4 py-2 ${userToBan?.Status === 'inactive' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white rounded-md font-medium flex items-center`}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        userToBan?.Status === 'inactive' ? 'Unban User' : 'Ban User'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Container>
      )}
    </div>
  );
};

export default UserManagement;
