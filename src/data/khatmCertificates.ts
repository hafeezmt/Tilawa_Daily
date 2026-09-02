export interface KhatmCertificateData {
  recipientName: string;
  completionDate: string;
  cycleNumber: number;
  totalHizbs: number;
  ustadhSignature: string;
}

export function generateKhatmCertificateSummary(data: KhatmCertificateData): string {
  return `📜 SHAHADAR KAMMALA SAUKAR AL-QUR'ANI (TILAWA DAILY)\n\n` +
    `Wannan takarda tana tabbatar da cewa:\n` +
    `Malam/Malama: ${data.recipientName}\n` +
    `Ya/Ta halarci kuma ya/ta kammala dukkanin Hizb ${data.totalHizbs} a zagaye na ${data.cycleNumber}.\n` +
    `Kwanan Wata: ${data.completionDate}\n` +
    `Sa hannun Ustadh: ${data.ustadhSignature}\n\n` +
    `Muna rokon Allah Madaukakin Sarki Ya sanya wannan karatu ya zama haske da shiriya a rayuwarsa/ta. Ameen! 🤲`;
}
