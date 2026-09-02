import { HizbInfo, MemberUser } from '../types';

export function exportKhatmReportCSV(hizbs: HizbInfo[], members: MemberUser[]): void {
  const headers = ['Hizb Number', 'Juz Number', 'Surah Name', 'Arabic Name', 'Status', 'Assigned Reciter'];
  const rows = hizbs.map(h => [
    h.hizbNumber,
    h.juzNumber,
    `"${h.surahName}"`,
    `"${h.surahArabic}"`,
    h.status,
    `"${h.assignedReciter || 'Unassigned'}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + 
    [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Tilawa_Daily_Khatm_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
