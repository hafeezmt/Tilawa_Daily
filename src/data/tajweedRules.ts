export interface TajweedRule {
  id: number;
  nameArabic: string;
  nameEnglish: string;
  nameHausa: string;
  descriptionEnglish: string;
  descriptionHausa: string;
  example: string;
}

export const TAJWEED_RULES: TajweedRule[] = [
  {
    id: 1,
    nameArabic: 'الإظهار الحلقي',
    nameEnglish: 'Izhar Halqi (Clear Pronunciation)',
    nameHausa: 'Izhar (Bayyana Haruffa)',
    descriptionEnglish: 'Pronouncing the Noon Sakinah or Tanween clearly without nasalization when followed by throat letters (ء, هـ, ع, ح, غ, خ).',
    descriptionHausa: 'Bayyana haruffan Noon Sakina ko Tanween a fili ba tare da gunda ba idan suka hadu da haruffan makogwaro.',
    example: 'مِنْ خَوْفٍ • أَنْعَمْتَ'
  },
  {
    id: 2,
    nameArabic: 'الإدغام بغنة',
    nameEnglish: 'Idgham with Ghunnah (Nasal Merging)',
    nameHausa: 'Idgham tare da Gunda',
    descriptionEnglish: 'Merging the Noon Sakinah or Tanween into the letters (ي, ن, م, و) with a 2-count nasal sound.',
    descriptionHausa: 'Shigar da harafin Noon Sakina a cikin haruffan (Yanmu) tare da tsawaita gunda.',
    example: 'مَن يَقُولُ • مِّن نَّعْمَةٍ'
  },
  {
    id: 3,
    nameArabic: 'الإقلاب',
    nameEnglish: 'Iqlab (Conversion to Meem)',
    nameHausa: 'Iqlab (Juyarwa zuwa Meem)',
    descriptionEnglish: 'Converting Noon Sakinah or Tanween into a hidden Meem with ghunnah when followed by Ba (ب).',
    descriptionHausa: 'Juyar da Noon Sakina ko Tanween zuwa harafin Meem mai gunda idan ya hadu da harafin Ba.',
    example: 'مِنۢ بَعْدِ • أَنۢبِئْهُم'
  },
  {
    id: 4,
    nameArabic: 'الإخفاء الحقيقي',
    nameEnglish: 'Ikhfa Haqiqi (Concealment)',
    nameHausa: 'Ikhfa (Boye Haruffa da Gunda)',
    descriptionEnglish: 'Concealing the Noon Sakinah or Tanween with a light ghunnah when followed by any of the 15 Ikhfa letters.',
    descriptionHausa: 'Boye sautin Noon Sakina tare da gunda a wajen haruffan Ikhfa guda goma sha biyar.',
    example: 'مِن تَحْتِهَا • كُنتُمْ'
  },
  {
    id: 5,
    nameArabic: 'القلقلة',
    nameEnglish: 'Qalqalah (Echoing / Bouncing)',
    nameHausa: 'Qalqalah (Bugi / Rawa)',
    descriptionEnglish: 'Vibrating or bouncing the 5 Qalqalah letters (ق, ط, ب, ج, د) when they have a Sukoon or stop.',
    descriptionHausa: 'Yin bugi ko rawar sauti a kan haruffan Qutbu Jaddan (ق, ط, ب, ج, د) idan suna da Sukun.',
    example: 'الْفَلَقِ • قُلْ هُوَ اللَّهُ أَحَدٌ'
  }
];
