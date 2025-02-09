import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAppointments } from '../../hooks/useAppointments';
import { ArrowLeft } from 'lucide-react';
import BeautyCapture from '../shared/BeautyCapture';
import { Button } from '../ui/button';
import { AftercareSummary } from './aftercare/AftercareSummary';
import { FooterNav } from '../shared/FooterNav';
import { format } from 'date-fns';
import { Appointment } from '../../types/appointment';

type ServiceState = 'initial' | 'before' | 'after' | 'summary';

interface ImageData {
  uri: string;
  timestamp: string;
}

interface ServiceFlowProps {
  onServiceStateChange?: (state: 'idle' | 'started' | 'completed') => void;
}

export const ServiceFlow: React.FC<ServiceFlowProps> = ({ onServiceStateChange }) => {
  const { currentUser } = useAuth();
  const { appointments, loading } = useAppointments();
  const [serviceState, setServiceState] = useState<ServiceState>('initial');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [beforeImage, setBeforeImage] = useState<ImageData | null>(null);
  const [afterImage, setAfterImage] = useState<ImageData | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todaysAppointments = appointments?.filter(
    (appt) => appt.date === today
  );

  useEffect(() => {
    if (serviceState === 'initial' && onServiceStateChange) {
      onServiceStateChange('idle');
    }
  }, [serviceState, onServiceStateChange]);

  const handleStartService = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setServiceState('before');
    if (onServiceStateChange) {
      onServiceStateChange('started');
    }
  };

  const handleBeforeImage = (image: ImageData) => {
    setBeforeImage(image);
    setServiceState('after');
  };

  const handleAfterImage = (image: ImageData) => {
    setAfterImage(image);
    setServiceState('summary');
    if (onServiceStateChange) {
      onServiceStateChange('completed');
    }
  };

  const navigate = useNavigate();

  if (loading) return <div>Loading...</div>;

  const handleBack = () => {
    if (serviceState === 'before') {
      setServiceState('initial');
    } else if (serviceState === 'after') {
      setServiceState('before');
    } else if (serviceState === 'summary') {
      setServiceState('after');
    } else {
      navigate('/professional/dashboard');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 bg-white z-10 border-b">
        <div className="container mx-auto px-4 py-2 flex items-center">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="ml-2 text-xl font-bold">
            {serviceState === 'initial' && 'Service Flow'}
            {serviceState === 'before' && 'Before Service'}
            {serviceState === 'after' && 'After Service'}
            {serviceState === 'summary' && 'Service Summary'}
          </h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        {serviceState === 'initial' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Today's Appointments</h2>
            {todaysAppointments?.length > 0 ? (
              todaysAppointments.map((appt) => (
                <div key={appt.id} className="p-4 border rounded-lg">
                  <h3 className="font-medium">{appt.clientName}</h3>
                  <p>{appt.serviceName}</p>
                  <p>{format(new Date(appt.date), 'h:mm a')}</p>
                  <div className="mt-2 space-y-2">
                    <h4 className="font-medium">AI Consultation Notes:</h4>
                    <p className="text-sm text-gray-600">{appt.notes || 'No notes available'}</p>
                    <h4 className="font-medium">Previous Products Used:</h4>
                    <p className="text-sm text-gray-600">{appt.productsUsed?.join(', ') || 'No product history'}</p>
                  </div>
                  <Button 
                    className="mt-4 w-full"
                    onClick={() => handleStartService(appt)}
                  >
                    START SERVICE
                  </Button>
                </div>
              ))
            ) : (
              <p>No appointments scheduled for today</p>
            )}
          </div>
        )}

        {serviceState === 'before' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Before Service</h2>
            <div className="mb-4 space-y-2">
              <h3 className="font-medium">Client: {selectedAppointment?.clientName}</h3>
              <p>Service: {selectedAppointment?.serviceName}</p>
              <div className="text-sm text-gray-600">
                <h4 className="font-medium">AI Consultation Notes:</h4>
                <p>{selectedAppointment?.notes}</p>
                <h4 className="font-medium mt-2">Previous Products Used:</h4>
                <p>{selectedAppointment?.productsUsed?.join(', ')}</p>
              </div>
            </div>
            <BeautyCapture 
              onCapture={handleBeforeImage}
              instructions="Take a before photo of the client"
            />
          </div>
        )}

        {serviceState === 'after' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">After Service</h2>
            <BeautyCapture 
              onCapture={handleAfterImage}
              instructions="Take an after photo of the client"
            />
          </div>
        )}

        {serviceState === 'summary' && (
          <AftercareSummary 
            appointment={selectedAppointment}
            beforeImage={beforeImage}
            afterImage={afterImage}
          />
        )}
      </main>

      <FooterNav 
        userType="professional" 
        serviceState={serviceState === 'initial' ? 'idle' : 'started'}
        onServiceAction={() => setServiceState('before')}
      />
    </div>
  );
};
