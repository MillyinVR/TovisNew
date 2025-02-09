import React, { useState } from 'react';
import { Clock, Users, DollarSign, MapPin, Bell } from 'lucide-react';
import { format, addHours } from 'date-fns';

interface TimeSlot {
  id: string;
  startTime: Date;
  service: string;
  originalPrice: number;
  discount: number;
  waitlistCount: number;
}

export const LastMinuteTab = () => {
  const [openSlots, setOpenSlots] = useState<TimeSlot[]>([
    {
      id: '1',
      startTime: addHours(new Date(), 3),
      service: 'Soft Glam Makeup',
      originalPrice: 120,
      discount: 20,
      waitlistCount: 3
    },
    {
      id: '2',
      startTime: addHours(new Date(), 6),
      service: 'Natural Makeup',
      originalPrice: 100,
      discount: 10,
      waitlistCount: 1
    },
    {
      id: '3',
      startTime: addHours(new Date(), 24),
      service: 'Editorial Makeup',
      originalPrice: 200,
      discount: 10,
      waitlistCount: 5
    }
  ]);

  const handleOptIn = (slotId: string) => {
    // In production, this would update the backend
    console.log('Opted in for slot:', slotId);
  };

  const getDiscountLabel = (hours: number, discount: number) => {
    if (hours <= 24) {
      return `${discount}% off - Same day booking`;
    }
    return `${discount}% off - Last minute deal`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Last Minute Bookings</h2>
            <p className="text-sm text-gray-500">
              Fill your empty slots with automatic discounts
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            <Bell className="h-4 w-4 mr-2" />
            Notify All Waitlist
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {openSlots.map((slot) => {
            const hoursUntil = Math.round((slot.startTime.getTime() - new Date().getTime()) / (1000 * 60 * 60));
            
            return (
              <div key={slot.id} className="border rounded-lg p-4 hover:border-indigo-500 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <Clock className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{slot.service}</h3>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{format(slot.startTime, 'MMM d, h:mm a')}</span>
                        <span className="mx-2">•</span>
                        <span>{hoursUntil} hours from now</span>
                      </div>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className="inline-flex items-center text-sm">
                          <Users className="h-4 w-4 mr-1 text-gray-400" />
                          {slot.waitlistCount} on waitlist
                        </span>
                        <span className="inline-flex items-center text-sm text-green-600">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ${slot.originalPrice * (1 - slot.discount / 100)} 
                          <span className="ml-1 text-gray-500 line-through">${slot.originalPrice}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {getDiscountLabel(hoursUntil, slot.discount)}
                    </span>
                    <button
                      onClick={() => handleOptIn(slot.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                    >
                      Opt In
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Last Minute Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Automatic Discounts</h4>
              <p className="text-sm text-gray-500">Enable automatic discounts for last-minute bookings</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Waitlist Notifications</h4>
              <p className="text-sm text-gray-500">Notify waitlisted clients about available slots</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};