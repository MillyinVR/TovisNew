import React from 'react';
import { Appointment } from '../../types/appointment';

interface AftercareSummaryProps {
  appointment: Appointment | null;
  beforeImage: { uri: string; timestamp: string } | null;
  afterImage: { uri: string; timestamp: string } | null;
}

export const AftercareSummary: React.FC<AftercareSummaryProps> = ({
  appointment,
  beforeImage,
  afterImage
}) => {
  if (!appointment) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Aftercare Summary</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium">Before</h3>
          {beforeImage && (
            <img 
              src={beforeImage.uri} 
              alt="Before service" 
              className="w-full rounded-lg"
            />
          )}
        </div>
        <div>
          <h3 className="font-medium">After</h3>
          {afterImage && (
            <img 
              src={afterImage.uri} 
              alt="After service" 
              className="w-full rounded-lg"
            />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Client: {appointment.clientName}</h3>
        <p>Service: {appointment.serviceName}</p>
        <div className="text-sm text-gray-600">
          <h4 className="font-medium">AI Consultation Notes:</h4>
          <p>{appointment.notes || 'No notes available'}</p>
          <h4 className="font-medium mt-2">Previous Products Used:</h4>
          <p>{appointment.productsUsed?.join(', ') || 'No product history'}</p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Aftercare Instructions</h3>
        <textarea
          className="w-full p-2 border rounded-lg"
          placeholder="Enter aftercare instructions..."
          rows={4}
        />
      </div>

      <button 
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        onClick={() => console.log('Aftercare submitted')}
      >
        Submit Aftercare Summary
      </button>
    </div>
  );
};
