import React from 'react';
import { useAppointments } from '../../../hooks/useAppointments';
import { AppointmentStatus, Appointment } from '../../../types/appointment';
import { format } from 'date-fns';
import { Badge } from '../../ui/badge';
import { FooterNav } from '../../shared/FooterNav';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Bookings: React.FC = () => {
  const navigate = useNavigate();
  const { appointments, loading } = useAppointments();

  const groupedAppointments = {
    requested: appointments.filter((a: Appointment) => a.status === AppointmentStatus.REQUESTED),
    prebooked: appointments.filter((a: Appointment) => a.status === AppointmentStatus.PREBOOKED),
    scheduled: appointments.filter((a: Appointment) => a.status === AppointmentStatus.SCHEDULED)
  };

  const statusBadge = (status: AppointmentStatus): JSX.Element | null => {
    switch(status) {
      case AppointmentStatus.REQUESTED:
        return <Badge variant="secondary">Requested</Badge>;
      case AppointmentStatus.PREBOOKED:
        return <Badge variant="warning">Prebooked</Badge>;
      case AppointmentStatus.SCHEDULED:
        return <Badge variant="success">Scheduled</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="p-4 space-y-6 pb-24">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <h1 className="text-2xl font-bold">Your Bookings</h1>
        
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Requested</h2>
              {groupedAppointments.requested.map((appointment: Appointment) => (
                <div key={appointment.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{appointment.serviceName}</h3>
                      <p className="text-sm text-gray-500">{appointment.professionalName}</p>
                    </div>
                    {statusBadge(appointment.status)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Prebooked</h2>
              {groupedAppointments.prebooked.map((appointment: Appointment) => (
                <div key={appointment.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{appointment.serviceName}</h3>
                      <p className="text-sm text-gray-500">{appointment.professionalName}</p>
                      <p className="text-sm">{format(new Date(appointment.date), 'MMM d, yyyy h:mm a')}</p>
                    </div>
                    {statusBadge(appointment.status)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Scheduled</h2>
              {groupedAppointments.scheduled.map((appointment: Appointment) => (
                <div key={appointment.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{appointment.serviceName}</h3>
                      <p className="text-sm text-gray-500">{appointment.professionalName}</p>
                      <p className="text-sm">{format(new Date(appointment.date), 'MMM d, yyyy h:mm a')}</p>
                    </div>
                    {statusBadge(appointment.status)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0">
        <FooterNav userType="client" />
      </div>
    </div>
  );
};

export default Bookings;
