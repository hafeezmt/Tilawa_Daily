# 📖 Tilawa Daily (تلاوة يومية)

> **Real-Time Live Quran Halaqah & 5-Hizb Daily Recitation Platform**  
> *Designed for 600+ member Islamic recitation circles to complete the entire Holy Qur'an every 12 days.*

---

## 🌟 Key Features

- 🎙️ **Google Meet-Style Live Voice Halaqah**:
  - Real-time WebRTC audio broadcasting with sub-second latency.
  - Multi-user participant grid tiles with live voice waveforms, role badges (*Ustadh / Reciter / Member*), and raised hand queue.
- 🚪 **Meeting Codes & "Ask to Join" Admission**:
  - Unique shareable room codes (`TIL-5HIZB-DAILY`).
  - Host/Ustadh admission approval modal with `[Admit]` and `[Deny]` actions.
- 📖 **Complete Digital Quran Mushaf**:
  - 114 Surahs and 60 Hizbs index.
  - Madinah Uthmani script with adjustable typography scaling.
  - Dual language translation (Hausa & English Sahih International).
  - Audio playback (Mishary Rashid Alafasy) with floating sticky Stop / Play / Pause / Ayah skip controller.
- 📊 **5-Hizb Daily Khatm Tracker**:
  - 12-day full Khatm cycle tracker.
  - Member turn claiming and completion badges.
- 🛡️ **Admin-Approved Member Registry**:
  - Registration queue with Ustadh PIN security verification.
- 📱 **Cross-Platform Mobile Ready**:
  - Configured with Capacitor for Android (`.apk`) and iOS (`.ipa`) builds.
  - PWA home-screen installable.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Voice / Audio Engine**: PeerJS WebRTC Audio Mesh + Google STUN servers
- **Backend / Database**: Supabase + LocalStorage fallback
- **Mobile Runtime**: Capacitor Native Android Framework
- **Icons**: Lucide React SVG vector icons

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/hafeezmt/Tilawa_Daily.git

# Navigate to project directory
cd Tilawa_Daily

# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

---

## 📱 Mobile Android APK Build

```bash
# Open in Android Studio
npx cap open android
```

---

## 📄 License
MIT License. Dedicated to the Muslim Ummah for Quranic recitation and learning.
