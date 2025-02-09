import { useEffect, useState } from 'react';
import { CalendarEvent } from '../types/calendar';
import { syncProfessionalCalendar } from '../lib/api/calendar';
import { useAuth } from '../contexts/AuthContext';

export const useCalendar = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const syncCalendar = async () => {
    if (!currentUser || currentUser.role !== 'professional') return;

    try {
      setLoading(true);
      const professionalEvents = await syncProfessionalCalendar(currentUser.uid);
      setEvents(professionalEvents);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'professional') {
      syncCalendar();
    }
  }, [currentUser]);

  return {
    events,
    loading,
    error,
    syncCalendar,
  };
};
