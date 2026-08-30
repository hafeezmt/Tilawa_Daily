import { useState } from 'react';
import { BackgroundGlows } from './components/BackgroundGlows';
import { Navbar } from './components/Navbar';
import { LiveHalaqahRoom } from './components/LiveHalaqahRoom';
import { QuranReader } from './components/QuranReader';
import { DailyTracker } from './components/DailyTracker';
import { GroupRulesModal } from './components/GroupRulesModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileDrawer } from './components/UserProfileDrawer';
import { Logo } from './components/Logo';
import { AuthProvider } from './context/AuthContext';
import { Sparkles } from 'lucide-react';

function AppContent() {
  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'halaqah' | 'quran' | 'tracker'>('halaqah');
  
  // Current Recitation Hizb in the 5-Hizb Daily Cycle
  const [currentHizb, setCurrentHizb] = useState<number>(1);
  
  // Modals & Overlays
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [showShareToast, setShowShareToast] = useState<boolean>(false);

  // Group Capacity & Live State (Simulated 624 members in Halaqah)
  const [listenerCount] = useState<number>(624);
  const [isLive] = useState<boolean>(true);

  // Navigate directly to specific Hizb and switch to Quran Reader
  const handleNavigateToHizb = (hizbNumber: number) => {
    setCurrentHizb(hizbNumber);
    setActiveTab('quran');
  };

  // Copy share invite link
  const handleShare = () => {
    const shareText = `As-salamu alaykum! Join our Tilawa Daily Quran Recitation Halaqah (Today: Hizb 1-5): ${window.location.href}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
    }
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3500);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden">
      {/* Dynamic Ambient Background Glows */}
      <BackgroundGlows />

      {/* Top Glass Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openRules={() => setIsRulesModalOpen(true)}
        listenerCount={listenerCount}
        isLive={isLive}
        onShare={handleShare}
      />

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1">
        
        {/* Share Link Toast Alert */}
        {showShareToast && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl glass-panel border border-gold-500/50 text-xs font-bold text-gold-200 shadow-glass-lg flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>Invitation link copied! Share it to your Tilawa Daily WhatsApp group.</span>
          </div>
        )}

        {/* View Switcher based on Active Tab */}
        {activeTab === 'halaqah' && (
          <LiveHalaqahRoom
            currentHizb={currentHizb}
            onNavigateToHizb={handleNavigateToHizb}
            listenerCount={listenerCount}
          />
        )}

        {activeTab === 'quran' && (
          <QuranReader
            currentHizb={currentHizb}
            onSelectHizb={(hNum) => setCurrentHizb(hNum)}
          />
        )}

        {activeTab === 'tracker' && (
          <DailyTracker
            onSelectHizb={handleNavigateToHizb}
          />
        )}

      </main>

      {/* Group Rules Modal */}
      <GroupRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {/* Auth Modal (Login / Sign Up) */}
      <AuthModal />

      {/* User Profile Drawer */}
      <UserProfileDrawer />

      {/* Footer (Glass Surface) */}
      <footer className="relative z-10 w-full glass-panel border-t border-white/10 mt-12 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          <div className="flex items-center gap-4">
            <Logo size={38} showText={true} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-400">
            <button onClick={() => setActiveTab('halaqah')} className="hover:text-gold-300 transition-colors">
              Live Halaqah Room
            </button>
            <button onClick={() => setActiveTab('quran')} className="hover:text-gold-300 transition-colors">
              Holy Quran Mushaf
            </button>
            <button onClick={() => setActiveTab('tracker')} className="hover:text-gold-300 transition-colors">
              5-Hizb Schedule
            </button>
            <button onClick={() => setIsRulesModalOpen(true)} className="hover:text-gold-300 transition-colors">
              Dokokin Group (Rules)
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            <p>© {new Date().getFullYear()} Tilawa Daily. Dedicated to Quran Recitation.</p>
            <p className="text-[10px] text-gold-400/80 font-arabic mt-0.5">وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا</p>
          </div>

        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
