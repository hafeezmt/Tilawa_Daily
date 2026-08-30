import { GroupRuleItem } from '../types';

export const GROUP_RULES: GroupRuleItem[] = [
  {
    id: 1,
    iconName: 'UserX',
    hausaText: 'Babu namiji ya bi mace (private message)',
    englishText: 'Brothers must not send private messages (DM) to sisters',
    category: 'safety'
  },
  {
    id: 2,
    iconName: 'UserX',
    hausaText: 'Babu mace ta bi namiji (private message)',
    englishText: 'Sisters must not send private messages (DM) to brothers',
    category: 'safety'
  },
  {
    id: 3,
    iconName: 'HeartHandshake',
    hausaText: 'Duk mu yi mu\'amala cikin girmamawa da ladabi',
    englishText: 'Treat each other with mutual respect, dignity, and Islamic etiquette',
    category: 'decorum'
  },
  {
    id: 4,
    iconName: 'BookOpen',
    hausaText: 'A yi sharing na Al-Qur\'ani da abin amfani kawai',
    englishText: 'Share only Quranic recitation, beneficial knowledge, and group announcements',
    category: 'worship'
  },
  {
    id: 5,
    iconName: 'ShieldAlert',
    hausaText: 'Babu spam, barkwanci marar amfani ko rikici',
    englishText: 'No spamming, unrelated memes, jokes, or disputes in the group',
    category: 'decorum'
  },
  {
    id: 6,
    iconName: 'Sparkles',
    hausaText: 'A kiyaye tsabta da natsuwa a group',
    englishText: 'Maintain serenity, purity, and spiritual tranquility during sessions',
    category: 'decorum'
  },
  {
    id: 7,
    iconName: 'ShieldCheck',
    hausaText: 'Duk wani sabani a tuntubi admin cikin ladabi',
    englishText: 'For any disagreements or queries, contact the Admin respectfully',
    category: 'admin'
  },
  {
    id: 8,
    iconName: 'Moon',
    hausaText: 'Manufarmu ita ce Tilawa da ilmantar da juna',
    englishText: 'Our sole purpose is Quran recitation (Tilawa) and mutual Islamic learning',
    category: 'worship'
  }
];
