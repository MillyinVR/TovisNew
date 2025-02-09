import React, { useState } from 'react';
import { UserPlus, Shield, Edit2, Trash2, Lock } from 'lucide-react';
import { Permission, PermissionAction, PermissionResource } from '../../../types/auth';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  userCount: number;
}

export const RoleManagement = () => {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: 'Super Admin',
      description: 'Complete system control and oversight',
      permissions: [
        { action: 'create', resource: 'users' },
        { action: 'read', resource: 'users' },
        { action: 'update', resource: 'users' },
        { action: 'delete', resource: 'users' }
      ],
      userCount: 2
    },
    {
      id: '2',
      name: 'Operations Admin',
      description: 'Professional and service management',
      permissions: [
        { action: 'read', resource: 'users' },
        { action: 'update', resource: 'users' }
      ],
      userCount: 5
    }
  ]);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const permissionActions: PermissionAction[] = ['create', 'read', 'update', 'delete'];
  const permissionResources: PermissionResource[] = ['users', 'bookings', 'services', 'settings'];

  const handleDeleteRole = (roleId: string) => {
    setRoles(roles.filter(role => role.id !== roleId));
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Role Management</h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage system roles and permissions
            </p>
          </div>
          <button
            onClick={() => setShowRoleModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Role
          </button>
        </div>

        {/* Roles List */}
        <div className="mt-6 space-y-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="border rounded-lg p-4 hover:border-indigo-500 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-indigo-500" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{role.name}</h4>
                    <p className="text-sm text-gray-500">{role.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {role.userCount} users
                  </span>
                  <button
                    onClick={() => {
                      setEditingRole(role);
                      setShowRoleModal(true);
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Permissions Grid */}
              <div className="mt-4 border-t pt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Permissions</h5>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {role.permissions.map((permission, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-md px-2 py-1"
                    >
                      <Lock className="h-4 w-4 text-indigo-500" />
                      <span>{permission.action}</span>
                      <span className="text-gray-400">|</span>
                      <span>{permission.resource}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Role Modal */}
        {showRoleModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingRole ? 'Edit Role' : 'Add New Role'}
                </h3>
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setEditingRole(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Role Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    defaultValue={editingRole?.name}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    defaultValue={editingRole?.description}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {permissionResources.map((resource) => (
                        <div key={resource} className="space-y-2">
                          <h6 className="text-sm font-medium text-gray-900 capitalize">
                            {resource}
                          </h6>
                          <div className="space-y-2">
                            {permissionActions.map((action) => (
                              <label key={`${resource}-${action}`} className="flex items-center">
                                <input
                                  type="checkbox"
                                  defaultChecked={editingRole?.permissions.some(
                                    p => p.action === action && p.resource === resource
                                  )}
                                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="ml-2 text-sm text-gray-600 capitalize">
                                  {action}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoleModal(false);
                      setEditingRole(null);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    {editingRole ? 'Update Role' : 'Create Role'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};