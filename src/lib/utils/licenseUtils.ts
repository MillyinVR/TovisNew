import { ProfessionalVerification } from '@/types/professional';

export const checkLicenseExpiration = (licenseExpirationDate?: string): {
  isExpiring: boolean;
  daysUntilExpiration: number | null;
} => {
  if (!licenseExpirationDate) {
    return { isExpiring: false, daysUntilExpiration: null };
  }

  const expirationDate = new Date(licenseExpirationDate);
  const today = new Date();
  const differenceInTime = expirationDate.getTime() - today.getTime();
  const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

  return {
    isExpiring: differenceInDays <= 30 && differenceInDays > 0,
    daysUntilExpiration: differenceInDays > 0 ? differenceInDays : null
  };
};
