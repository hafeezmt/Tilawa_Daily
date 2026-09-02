export function getFormattedHijriDate(): string {
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return formatter.format(date);
  } catch (e) {
    return '١٤٤٧ هـ';
  }
}
