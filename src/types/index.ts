export type UserRole = 'admin' | 'ustadh' | 'reciter' | 'member';
export type MemberStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  avatar?: string;
  provider?: 'google' | 'facebook' | 'email';
  role: UserRole;
  status: MemberStatus;
  title?: string;
  hizbsRecited: number;
  streakDays: number;
  bookmarks: number[];
  joinedDate: string;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  startJuz: number;
  startHizb: number;
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  textArabic?: string;
  text?: string;
  translationHa?: string;
  translationEn?: string;
  textTranslationHausa?: string;
  textTranslationEnglish?: string;
  surahNumber?: number;
  hizbNumber?: number;
  juz?: number;
  hizbQuarter?: number;
  page?: number;
  audio?: string;
  audioUrl?: string;
}

export interface HizbInfo {
  hizbNumber: number;
  juzNumber: number;
  startSurah: number;
  startAyah: number;
  surahName: string;
  surahArabic: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedReciter?: string;
}

export interface QueueMember {
  id: string;
  name: string;
  hizbTarget?: number;
  joinedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  role: 'admin' | 'reciter' | 'member';
  text: string;
  timestamp: string;
}

export interface GroupRuleItem {
  id: number;
  category: string;
  title?: string;
  hausaText: string;
  englishText: string;
  titleHausa?: string;
  titleEnglish?: string;
  descriptionHausa?: string;
  descriptionEnglish?: string;
  iconName?: string;
}
