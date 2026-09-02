export interface ReciterInfo {
  id: string;
  name: string;
  nameArabic: string;
  style: string;
}

export const RECITERS_LIST: ReciterInfo[] = [
  {
    id: 'ar.alafasy',
    name: 'Mishary Rashid Alafasy',
    nameArabic: 'مشاري بن راشد العفاسي',
    style: 'Murattal'
  },
  {
    id: 'ar.husary',
    name: 'Mahmoud Khalil Al-Husary',
    nameArabic: 'محمود خليل الحصري',
    style: 'Muallim / Educational'
  },
  {
    id: 'ar.abdulbasitmurattal',
    name: 'Abdulbasit Abdussamad',
    nameArabic: 'عبد الباسط عبد الصمد',
    style: 'Murattal'
  },
  {
    id: 'ar.saoodshuraym',
    name: 'Saud Al-Shuraim',
    nameArabic: 'سعود الشريم',
    style: 'Haramain Makkah'
  },
  {
    id: 'ar.abdurrahmaansudais',
    name: 'Abdur-Rahman As-Sudais',
    nameArabic: 'عبد الرحمن السديس',
    style: 'Haramain Makkah'
  }
];
