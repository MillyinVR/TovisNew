import React from 'react';
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
  if (!isOpen) return null;

  const handleWorkingHoursChange = (
    day: string,
    field: 'start' | 'end' | 'enabled',
    value: string | boolean
  ) => {
    const updatedHours = {
      ...workingHours,
      [day]: {
        ...workingHours[day],
        [field]: value
      }
    };
    onSave(updatedHours);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Working Hours</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(workingHours).map(([day, hours]) => (
            <div key={day} className="flex items-center space-x-4">
              <div className="w-32">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={hours.enabled}
                    onChange={(e) => handleWorkingHoursChange(day, 'enabled', e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
                    {day}
                  </span>
                </label>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={hours.start}
                    onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                    disabled={!hours.enabled}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={hours.end}
                    onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                    disabled={!hours.enabled}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={onCustomHours}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Hours
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};