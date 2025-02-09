import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  createSummary,
  getSummary,
  getProfessionalSummaries,
  getClientSummaries,
  updateSummaryStatus
} from '../lib/api/aftercare';
import { AftercareSummary } from '../types/aftercare';

export const useAftercare = (type: 'professional' | 'client') => {
  const { userProfile } = useAuth();
  const [summaries, setSummaries] = useState<AftercareSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummaries = async () => {
      if (!userProfile) return;

      try {
        setLoading(true);
        setError(null);

        const fetchedSummaries = type === 'professional'
          ? await getProfessionalSummaries(userProfile.id)
          : await getClientSummaries(userProfile.id);

        setSummaries(fetchedSummaries);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch summaries');
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, [userProfile, type]);

  const createAftercareSummary = async (
    summary: Omit<AftercareSummary, 'id' | 'status'>,
    beforeImages: File[],
    afterImages: File[]
  ) => {
    try {
      const summaryId = await createSummary(summary, beforeImages, afterImages);
      const newSummary = await getSummary(summaryId);
      setSummaries(prev => [newSummary, ...prev]);
      return summaryId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create summary');
      throw err;
    }
  };

  const updateStatus = async (
    summaryId: string,
    status: AftercareSummary['status']
  ) => {
    try {
      await updateSummaryStatus(summaryId, status);
      setSummaries(prev => prev.map(summary =>
        summary.id === summaryId
          ? { ...summary, status }
          : summary
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update summary status');
      throw err;
    }
  };

  return {
    summaries,
    loading,
    error,
    createAftercareSummary,
    updateStatus
  };
};