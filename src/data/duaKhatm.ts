export interface DuaKhatmItem {
  id: number;
  arabic: string;
  hausa: string;
  english: string;
}

export const DUA_KHATM_QURAN: DuaKhatmItem[] = [
  {
    id: 1,
    arabic: 'اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ، وَاجْعَلْهُ لِي إِمَاماً وَنُوراً وَهُدًى وَرَحْمَةً',
    hausa: 'Ya Allah Ka yi mini rahama da Al-Qur\'ani, kuma Ka sanya shi ya zama jagora, da haske, da shiriya, da rahama a gare ni.',
    english: 'O Allah, have mercy on me through the Quran, and make it for me a guide, a light, a guidance, and a mercy.'
  },
  {
    id: 2,
    arabic: 'اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ، وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ',
    hausa: 'Ya Allah Ka tunatar da ni abin da na manta daga cikinsa, kuma Ka koya mini abin da ban sani ba daga cikinsa.',
    english: 'O Allah, remind me from it what I have forgotten, and teach me from it what I am ignorant of.'
  },
  {
    id: 3,
    arabic: 'وَارْزُقْنِي تِلَاوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ، وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ الْعَالَمِينَ',
    hausa: 'Kuma Ka azurta ni da karatunsa a tsawon dare da sassan yini, kuma Ka sanya shi ya zama hujja a gare ni, Ya Ubangijin halittu.',
    english: 'And grant me its recitation during the hours of the night and the edges of the day, and make it a proof for me, O Lord of the worlds.'
  }
];
