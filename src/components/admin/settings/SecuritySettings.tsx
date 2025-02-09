import React, { useState } from 'react';
import { Shield, Lock, Key, AlertTriangle } from 'lucide-react';

export const SecuritySettings = () => {
  const [settings, setSettings] = useState({
    passwordPolicy: {
      minLength: 8,
      requireNumbers: true,
      requireSymbols: true,
      requireUppercase: true,
      maxAge: 90
    },
    loginAttempts: {
      maxAttempts: 5,
      lockoutDuration: 30,
      resetAfter: 24
    },
    twoFactor: {
      required: false,
      allowedMethods: ['sms', 'email', 'authenticator']
    },
    sessionTimeout: 30
  });

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
            <p className="mt-1 text-sm text-gray-500">
              Configure system-wide security policies
            </p>
          </div>
          <Shield className="h-6 w-6 text-gray-400" />
        </div>

        <div className="space-y-6">
          {/* Password Policy */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Password Policy</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Minimum Length
                </label>
                <input
                  type="number"
                  value={settings.passwordPolicy.minLength}
                  onChange={(e) => setSettings({
                    ...settings,
                    passwordPolicy: {
                      ...settings.passwordPolicy,
                      minLength: parseInt(e.target.value)
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Age (days)
                </label>
                <input
                  type="number"
                  value={settings.passwordPolicy.maxAge}
                  onChange={(e) => setSettings({
                    ...settings,
                    passwordPolicy: {
                      ...settings.passwordPolicy,
                      maxAge: parseInt(e.target.value)
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.passwordPolicy.requireNumbers}
                    onChange={(e) => setSettings({
                      ...settings,
                      passwordPolicy: {
                        ...settings.passwordPolicy,
                        requireNumbers: e.target.checked
                      }
                    })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Require numbers</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.passwordPolicy.requireSymbols}
                    onChange={(e) => setSettings({
                      ...settings,
                      passwordPolicy: {
                        ...settings.passwordPolicy,
                        requireSymbols: e.target.checked
                      }
                    })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Require symbols</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.passwordPolicy.requireUppercase}
                    onChange={(e) => setSettings({
                      ...settings,
                      passwordPolicy: {
                        ...settings.passwordPolicy,
                        requireUppercase: e.target.checked
                      }
                    })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Require uppercase letters</span>
                </label>
              </div>
            </div>
          </div>

          {/* Login Security */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Login Security</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  value={settings.loginAttempts.maxAttempts}
                  onChange={(e) => setSettings({
                    ...settings,
                    loginAttempts: {
                      ...settings.loginAttempts,
                      maxAttempts: parseInt(e.target.value)
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Lockout Duration (minutes)
                </label>
                <input
                  type="number"
                  value={settings.loginAttempts.lockoutDuration}
                  onChange={(e) => setSettings({
                    ...settings,
                    loginAttempts: {
                      ...settings.loginAttempts,
                      lockoutDuration: parseInt(e.target.value)
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reset After (hours)
                </label>
                <input
                  type="number"
                  value={settings.loginAttempts.resetAfter}
                  onChange={(e) => setSettings({
                    ...settings,
                    loginAttempts: {
                      ...settings.loginAttempts,
                      resetAfter: parseInt(e.target.value)
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Two-Factor Authentication</h4>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.twoFactor.required}
                  onChange={(e) => setSettings({
                    ...settings,
                    twoFactor: {
                      ...settings.twoFactor,
                      required: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-600">Require two-factor authentication</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed Methods
                </label>
                <div className="space-y-2">
                  {['sms', 'email', 'authenticator'].map((method) => (
                    <label key={method} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.twoFactor.allowedMethods.includes(method)}
                        onChange={(e) => {
                          const newMethods = e.target.checked
                            ? [...settings.twoFactor.allowedMethods, method]
                            : settings.twoFactor.allowedMethods.filter(m => m !== method);
                          setSettings({
                            ...settings,
                            twoFactor: {
                              ...settings.twoFactor,
                              allowedMethods: newMethods
                            }
                          });
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-600 capitalize">{method}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Session Settings */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Session Settings</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({
                  ...settings,
                  sessionTimeout: parseInt(e.target.value)
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};