export interface DailyReflection {
  hizbNumber: number;
  surah: string;
  ayah: string;
  arabicVerse: string;
  themeEnglish: string;
  themeHausa: string;
  lessonEnglish: string;
  lessonHausa: string;
}

export const DAILY_REFLECTIONS: DailyReflection[] = [
  {
    hizbNumber: 1,
    surah: 'Al-Baqarah',
    ayah: '2:2',
    arabicVerse: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ',
    themeEnglish: 'Divine Guidance for the Righteous',
    themeHausa: 'Shiriya Ga Masu Jin Tsoron Allah',
    lessonEnglish: 'The Holy Quran is free from any doubt and is the ultimate blueprint for leading a righteous, tranquil life.',
    lessonHausa: 'Al-Qur\'ani mai girma babu kokwanto a cikinsa, kuma shi ne cikakkiyar shiriya ga masu kiyaye dokokin Allah.'
  },
  {
    hizbNumber: 2,
    surah: 'Al-Baqarah',
    ayah: '2:45',
    arabicVerse: 'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى الْخَاشِعِينَ',
    themeEnglish: 'Patience and Prayer in Times of Hardship',
    themeHausa: 'Neman Taimako da Hakuri da Sallah',
    lessonEnglish: 'Whenever you face life tribulations, seek solace and strength through perseverance and sincere prayer.',
    lessonHausa: 'A duk lokacin da kuka fuskanci matsalolin rayuwa, ku nemi taimako ta hanyar hakuri da kiyaye sallah.'
  }
];
