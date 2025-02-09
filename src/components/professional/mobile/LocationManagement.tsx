import React, { useState } from 'react';
import { MapPin, Clock, Navigation, Shield, AlertTriangle } from 'lucide-react';

interface ServiceZone {
  id: string;
  name: string;
  radius: number;
  center: {
    lat: number;
    lng: number;
  };
  travelFee: number;
  active: boolean;
}

export const LocationManagement = () => {
  const [serviceZones, setServiceZones] = useState<ServiceZone[]>([
    {
      id: '1',
      name: 'Manhattan',
      radius: 5,
      center: { lat: 40.7831, lng: -73.9712 },
      travelFee: 25,
      active: true
    },
    {
      id: '2',
      name: 'Brooklyn',
      radius: 8,
      center: { lat: 40.6782, lng: -73.9442 },
      travelFee: 35,
      active: true
    }
  ]);

  const [selectedZone, setSelectedZone] = useState<ServiceZone | null>(null);
  const [showZoneModal, setShowZoneModal] = useState(false);

  const handleZoneUpdate = (updatedZone: ServiceZone) => {
    setServiceZones(zones => 
      zones.map(zone => zone.id === updatedZone.id ? updatedZone : zone)
    );
    setShowZoneModal(false);
    setSelectedZone(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Service Zones</h2>
            <p className="text-sm text-gray-500">Manage your mobile service coverage areas</p>
          </div>
          <button
            onClick={() => setShowZoneModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Zone
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceZones.map((zone) => (
            <div
              key={zone.id}
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400"
            >
              <div className="flex justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{zone.name}</h3>
                    <p className="text-sm text-gray-500">{zone.radius} mile radius</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    zone.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {zone.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Travel Fee: ${zone.travelFee}
                </div>
                <button
                  onClick={() => {
                    setSelectedZone(zone);
                    setShowZoneModal(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Travel Settings */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Travel Settings</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Clock className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-gray-900">Grace Period</h4>
              <p className="mt-1 text-sm text-gray-500">
                Set buffer time for travel delays
              </p>
              <select className="mt-2 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                <option>15 minutes</option>
                <option>30 minutes</option>
                <option>45 minutes</option>
                <option>60 minutes</option>
              </select>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Navigation className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-gray-900">Navigation Preferences</h4>
              <p className="mt-1 text-sm text-gray-500">
                Choose preferred navigation app
              </p>
              <select className="mt-2 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                <option>Google Maps</option>
                <option>Apple Maps</option>
                <option>Waze</option>
              </select>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Shield className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-gray-900">Privacy Settings</h4>
              <p className="mt-1 text-sm text-gray-500">
                Location sharing preferences
              </p>
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    defaultChecked
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Share location with clients
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    defaultChecked
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Enable real-time tracking
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-gray-900">Safety Settings</h4>
              <p className="mt-1 text-sm text-gray-500">
                Emergency contact information
              </p>
              <input
                type="tel"
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Emergency contact number"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};