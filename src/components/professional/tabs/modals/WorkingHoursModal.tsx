import React, { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { WorkingHours } from '../../../../types/calendar';

interface WorkingHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  workingHours: WorkingHours;
  onSave: (hours: WorkingHours) => void;
  onCustomHours: () => void;
}

export const WorkingHoursModal: React.FC<WorkingHoursModalProps> = ({
  isOpen,
  onClose,
  workingHours,
  onSave,
  onCustomHours
}) => {
  // Create a filtered version of working hours without the updatedAt field
  const [filteredHours, setFilteredHours] = useState<WorkingHours>({});
  
  useEffect(() => {
    // Filter out any non-day properties (like updatedAt)
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const filtered = Object.entries(workingHours)
      .filter(([key]) => validDays.includes(key))
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {} as WorkingHours);
    
    setFilteredHours(filtered);
  }, [workingHours]);
  
  if (!isOpen) return null;

  const handleWorkingHoursChange = (
    day: string,
    field: 'start' | 'end' | 'enabled',
    value: string | boolean
  ) => {
    const updatedHours = {
      ...filteredHours,
      [day]: {
        ...filteredHours[day],
        [field]: value
      }
    };
    onSave(updatedHours);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-3 sm:p-6 max-w-2xl w-full mx-2 sm:mx-0 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3 sm:mb-4 sticky top-0 bg-white pt-1 pb-2">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Working Hours</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {Object.entries(filteredHours).map(([day, hours]) => (
            <div key={day} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-2 border border-gray-100 rounded-md">
              <div className="w-full sm:w-32">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={hours.enabled}
                    onChange={(e) => handleWorkingHoursChange(day, 'enabled', e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-xs sm:text-sm font-medium text-gray-700 capitalize">
                    {day}
                  </span>
                </label>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={hours.start}
                    onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                    disabled={!hours.enabled}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={hours.end}
                    onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                    disabled={!hours.enabled}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0">
          <button
            onClick={onCustomHours}
            className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Add Custom Hours
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
