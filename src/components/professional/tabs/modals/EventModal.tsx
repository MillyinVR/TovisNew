import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { TimeSlot } from '../../../../types/calendar';
import { format } from 'date-fns';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  selectedEvent: TimeSlot | null;
  onAdd: (event: Partial<TimeSlot>) => void;
  onUpdate: (event: Partial<TimeSlot>) => void;
  onDelete: (eventId: string) => void;
  showWarning?: boolean;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  selectedEvent,
  onAdd,
  onUpdate,
  onDelete,
  showWarning = false,
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Get the date part from selectedDate
    const datePart = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
    
    // Get the time parts from the form
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    
    // Combine date and time
    const startDateTime = new Date(`${datePart}T${startTime}`);
    const endDateTime = new Date(`${datePart}T${endTime}`);

    const eventData = {
      title: formData.get('title') as string,
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      type: 'blocked' as const
    };

    if (selectedEvent) {
      onUpdate({ ...eventData, id: selectedEvent.id });
    } else {
      onAdd(eventData);
    }
  };

  const getTimeString = (date: Date | string | null) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'HH:mm');
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute inset-0 overflow-hidden">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedEvent ? 'Edit Blocked Time' : 'Block Time'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {showWarning && (
              <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      This time slot is outside your working hours. You can still schedule it, but it may affect client expectations.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  defaultValue={selectedEvent?.title}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., Lunch Break"
                  required
                />
              </div>

              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  defaultValue={getTimeString(selectedEvent?.start || selectedDate)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  defaultValue={getTimeString(selectedEvent?.end || (selectedDate && new Date(selectedDate.getTime() + 60 * 60 * 1000)))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                {selectedEvent && (
                  <button
                    type="button"
                    onClick={() => onDelete(selectedEvent.id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {selectedEvent ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};