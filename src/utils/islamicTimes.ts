export interface PrayerTime {
  name: string;
  nameArabic: string;
  nameHausa: string;
  time: string;
}

export const DAILY_HALAQAH_SCHEDULE = [
  { session: 'Fajr Halaqah', time: '05:45 AM', hizbTarget: 'Hizb 1', status: 'completed' },
  { session: 'Duha Recitation', time: '09:30 AM', hizbTarget: 'Hizb 2', status: 'completed' },
  { session: 'Zuhr Halaqah', time: '01:45 PM', hizbTarget: 'Hizb 3', status: 'in_progress' },
  { session: 'Asr Recitation', time: '04:30 PM', hizbTarget: 'Hizb 4', status: 'pending' },
  { session: 'Maghrib/Isha Halaqah', time: '07:30 PM', hizbTarget: 'Hizb 5', status: 'pending' },
];

export function getTodayRecitationDate(): string {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date().toLocaleDateString('en-US', options);
}
