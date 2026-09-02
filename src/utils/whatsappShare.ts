export function generateWhatsAppHalaqahInvite(
  roomCode: string = 'TIL-5HIZB-DAILY',
  currentHizb: number = 1,
  surahName: string = 'Al-Fatihah & Al-Baqarah'
): string {
  const url = window.location.origin;
  return `📢 *ZAUREN TILAWA DAILY (5-HIZB DAILY HALAQAH)* 📖\n\n` +
    `Assalamu Alaikum Yan Uwa masu albarka,\n\n` +
    `Ana gayyatarku zuwa zauren karatun Al-Qur'ani mai girma na yau da kullum.\n\n` +
    `🔹 *Target na Yau:* Hizb ${currentHizb} (${surahName})\n` +
    `🔹 *Meeting Code:* \`${roomCode}\`\n` +
    `🔹 *Shiga Kai Tsaye:* ${url}\n\n` +
    `_Manufarmu ita ce kammala saukar Al-Qur'ani mai girma a duk bayan kwanaki 12._\n` +
    `Ku shigo tare da natsuwa da alwala. Jazakumullahu Khairan! 🤲`;
}

export function copyWhatsAppInvite(roomCode: string, currentHizb: number, surahName: string): Promise<boolean> {
  const text = generateWhatsAppHalaqahInvite(roomCode, currentHizb, surahName);
  return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
}
