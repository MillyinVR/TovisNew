import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface CustomWorkingHours {
  date: string;
  start: string;
  end: string;
}

interface CustomWorkingHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hours: CustomWorkingHours[]) => void;
  existingHours?: CustomWorkingHours[];
}

export const CustomWorkingHoursModal: React.FC<CustomWorkingHoursModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingHours = []
}) => {
  const [customHours, setCustomHours] = useState<CustomWorkingHours[]>(existingHours);

  const addCustomHours = () => {
    setCustomHours([
      ...customHours,
      {
        date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        start: '09:00',
        end: '17:00'
      }
    ]);
  };

  const removeCustomHours = (index: number) => {
    setCustomHours(customHours.filter((_, i) => i !== index));
  };

  const updateCustomHours = (index: number, field: keyof CustomWorkingHours, value: string) => {
    setCustomHours(customHours.map((hours, i) => 
      i === index ? { ...hours, [field]: value } : hours
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Custom Working Hours</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {customHours.map((hours, index) => (
            <div key={index} className="flex items-center space-x-4">
              <input
                type="date"
                value={hours.date}
                onChange={(e) => updateCustomHours(index, 'date', e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min={format(new Date(), 'yyyy-MM-dd')}
              />
              <input
                type="time"
                value={hours.start}
                onChange={(e) => updateCustomHours(index, 'start', e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input
                type="time"
                value={hours.end}
                onChange={(e) => updateCustomHours(index, 'end', e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                onClick={() => removeCustomHours(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between">
          <button
            onClick={addCustomHours}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Hours
          </button>
          <div className="space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSave(customHours);
                onClose();
              }}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};