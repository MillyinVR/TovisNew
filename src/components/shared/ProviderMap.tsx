import React, { useState, useEffect } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import { MapPin, Search, AlertCircle } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface Provider {
  id: string;
  city: string;
  state: string;
  count: number;
  lat: number;
  lng: number;
}

const providers: Provider[] = [
  { id: '1', city: 'New York', state: 'NY', count: 245, lat: 40.7128, lng: -74.0060 },
  { id: '2', city: 'Los Angeles', state: 'CA', count: 189, lat: 34.0522, lng: -118.2437 },
  { id: '3', city: 'Houston', state: 'TX', count: 156, lat: 29.7604, lng: -95.3698 },
  { id: '4', city: 'Indianapolis', state: 'IN', count: 134, lat: 39.7684, lng: -86.1581 },
  { id: '5', city: 'Mesa', state: 'AZ', count: 123, lat: 33.4152, lng: -111.8315 },
  { id: '6', city: 'Milwaukee', state: 'WI', count: 98, lat: 43.0389, lng: -87.9065 },
  { id: '7', city: 'Nashville', state: 'TN', count: 87, lat: 36.1627, lng: -86.7816 },
  { id: '8', city: 'Oklahoma City', state: 'OK', count: 145, lat: 35.4676, lng: -97.5164 },
  { id: '9', city: 'Providence', state: 'RI', count: 76, lat: 41.8240, lng: -71.4128 },
  { id: '10', city: 'Queens', state: 'NY', count: 167, lat: 40.7282, lng: -73.7949 },
  { id: '11', city: 'Tucson', state: 'AZ', count: 92, lat: 32.2226, lng: -110.9747 },
  { id: '12', city: 'West Hollywood', state: 'CA', count: 134, lat: 34.0900, lng: -118.3617 }
];

export const ProviderMap = () => {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewport, setViewport] = useState({
    latitude: 39.8283,
    longitude: -98.5795,
    zoom: 3.5
  });

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      console.error('MapBox token is missing');
      setMapError('MapBox configuration error. Please check your environment variables.');
      return;
    }
  }, []);

  if (mapError) {
    return (
      <div className="w-full bg-white rounded-xl overflow-hidden shadow-lg p-6">
        <div className="flex items-center justify-center text-red-600">
          <AlertCircle className="h-6 w-6 mr-2" />
          <span>{mapError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-white rounded-xl overflow-hidden shadow-lg">
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Enter location"
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-lg text-gray-700 placeholder-gray-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full h-[300px] relative">
        <Map
          {...viewport}
          onMove={evt => setViewport(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%', position: 'relative' }}
          reuseMaps
          attributionControl={false}
          minZoom={2}
          maxZoom={15}
          onLoad={() => {
            console.log('Map loaded successfully');
            setMapLoaded(true);
          }}
          onError={(e) => {
            console.error('Map error:', e);
            setMapError('Unable to load map. Please check your internet connection and try again.');
          }}
        >
          {mapLoaded && providers.map((provider) => (
            <Marker
              key={provider.id}
              latitude={provider.lat}
              longitude={provider.lng}
              anchor="center"
              onClick={e => {
                e.originalEvent.stopPropagation();
                setSelectedProvider(provider);
              }}
            >
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-2">
                  <div className="w-4 h-4 bg-black/20 rounded-full animate-ping" />
                </div>
                <div className="relative w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-black rounded-full" />
                </div>
              </div>
            </Marker>
          ))}

          {selectedProvider && (
            <Popup
              latitude={selectedProvider.lat}
              longitude={selectedProvider.lng}
              anchor="bottom"
              onClose={() => setSelectedProvider(null)}
              closeButton={false}
              className="z-50"
              offset={25}
            >
              <div className="p-3">
                <h3 className="font-medium text-base">{selectedProvider.city}, {selectedProvider.state}</h3>
                <p className="text-sm text-gray-500">{selectedProvider.count} providers</p>
              </div>
            </Popup>
          )}

          <NavigationControl position="bottom-right" showCompass={false} />
        </Map>
      </div>
    </div>
  );
};