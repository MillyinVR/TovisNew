import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

interface LocationAutocompleteProps {
  onLocationSelect: (location: { address: string; coordinates: { lat: number; lng: number } }) => void;
  initialValue?: string;
  className?: string;
}

export const LocationAutocomplete = ({ onLocationSelect, initialValue = '', className = '' }: LocationAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const autoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        if (inputRef.current) {
          autoCompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            types: ['address'],
            componentRestrictions: { country: 'us' },
            fields: ['formatted_address', 'geometry']
          });

          autoCompleteRef.current.addListener('place_changed', () => {
            const place = autoCompleteRef.current?.getPlace();
            if (place?.geometry?.location && place.formatted_address) {
              onLocationSelect({
                address: place.formatted_address,
                coordinates: {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                }
              });
              setInputValue(place.formatted_address);
            }
          });
        }
      };
    };

    if (!window.google) {
      loadGoogleMapsScript();
    } else if (inputRef.current && !autoCompleteRef.current) {
      autoCompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'geometry']
      });
    }

    return () => {
      const script = document.querySelector('script[src*="maps.googleapis.com/maps/api"]');
      if (script) {
        script.remove();
      }
    };
  }, [onLocationSelect]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter your salon address"
        className={`w-full pl-10 pr-4 py-2 border rounded-md ${className}`}
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
    </div>
  );
};
