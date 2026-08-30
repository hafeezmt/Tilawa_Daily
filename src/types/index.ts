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
  text: string;
  translationEn?: string;
  translationHa?: string;
  juz: number;
  hizbQuarter: number;
  page: number;
  audio?: string;
}

export interface HizbInfo {
  hizbNumber: number;
  juzNumber: number;
  startSurah: number;
  startAyah: number;
  surahName: string;
  surahArabic: string;
  assignedReciter?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface QueueMember {
  id: string;
  name: string;
  hizbTarget?: number;
  joinedAt: string;
  isUstadh?: boolean;
}

export interface ReciterProfile {
  id: string;
  name: string;
  arabicName: string;
  subfolder: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  role: 'member' | 'admin' | 'reciter' | 'system';
  text: string;
  timestamp: string;
}

export interface GroupRuleItem {
  id: number;
  iconName: string;
  hausaText: string;
  englishText: string;
  category: 'decorum' | 'safety' | 'worship' | 'admin';
}
