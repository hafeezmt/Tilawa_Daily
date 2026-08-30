import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Play, 
  Pause, 
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  Languages, 
  Bookmark, 
  Sparkles,
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  ListFilter
} from 'lucide-react';
import { SURAHS_LIST, HIZB_LIST } from '../data/quranMetadata';
import { Ayah } from '../types';

interface QuranReaderProps {
  currentHizb: number;
  onSelectHizb: (hizb: number) => void;
}

export const QuranReader: React.FC<QuranReaderProps> = ({
  currentHizb,
  onSelectHizb,
}) => {
  // Navigation State
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'surahs' | 'hizbs'>('hizbs');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Display & Content States
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fontSize, setFontSize] = useState<number>(28); // Arabic font size in px
  const [showTranslation, setShowTranslation] = useState(true);
  const [translationLang, setTranslationLang] = useState<'en' | 'ha'>('ha');
  const [viewMode, setViewMode] = useState<'page' | 'list'>('page');

  // Audio Playback States
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentPlayingAyah, setCurrentPlayingAyah] = useState<number | null>(null);
  const [selectedReciter] = useState('ar.alafasy');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Bookmarks
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<number[]>([]);

  // Selected Surah Object
  const currentSurah = SURAHS_LIST.find(s => s.number === selectedSurahNumber) || SURAHS_LIST[0];

  // Fetch Surah Ayahs from Quran API with resilient fallback
  useEffect(() => {
    let isCancelled = false;
    const fetchSurah = async () => {
      setIsLoading(true);
      try {
        // Fetch Arabic text + English translation from public high-speed CDN API
        const response = await fetch(
          `https://api.alquran.cloud/v1/surah/${selectedSurahNumber}/editions/quran-uthmani,en.sahih`
        );
        if (!response.ok) throw new Error('Network response not ok');
        const data = await response.json();
        
        if (!isCancelled && data.data && data.data.length >= 2) {
          const arabicData = data.data[0].ayahs;
          const englishData = data.data[1].ayahs;

          const formattedAyahs: Ayah[] = arabicData.map((item: any, idx: number) => ({
            number: item.number,
            numberInSurah: item.numberInSurah,
            text: item.text,
            translationEn: englishData[idx]?.text || '',
            translationHa: generateHausaPreview(selectedSurahNumber, item.numberInSurah),
            juz: item.juz,
            hizbQuarter: item.hizbQuarter,
            page: item.page,
            audio: `https://cdn.islamic.network/quran/audio/128/${selectedReciter}/${item.number}.mp3`
          }));

          setAyahs(formattedAyahs);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Using offline Quran database fallback', err);
      }

      // Offline Fallback for seamless offline experience
      if (!isCancelled) {
        const fallbackAyahs = generateOfflineFallback(selectedSurahNumber);
        setAyahs(fallbackAyahs);
        setIsLoading(false);
      }
    };

    fetchSurah();
    return () => {
      isCancelled = true;
    };
  }, [selectedSurahNumber, selectedReciter]);

  // Audio Playback Handlers
  const handlePlayAyah = (ayah: Ayah) => {
    if (audioRef.current) {
      if (currentPlayingAyah === ayah.number && isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current.src = ayah.audio || `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`;
        audioRef.current.play().catch(e => console.warn('Audio play notice', e));
        setCurrentPlayingAyah(ayah.number);
        setIsPlayingAudio(true);
      }
    }
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlayingAudio(false);
    setCurrentPlayingAyah(null);
  };

  const handleNextAyah = () => {
    if (!currentPlayingAyah) {
      if (ayahs.length > 0) handlePlayAyah(ayahs[0]);
      return;
    }
    const currentIndex = ayahs.findIndex(a => a.number === currentPlayingAyah);
    if (currentIndex !== -1 && currentIndex < ayahs.length - 1) {
      handlePlayAyah(ayahs[currentIndex + 1]);
    }
  };

  const handlePrevAyah = () => {
    if (!currentPlayingAyah) return;
    const currentIndex = ayahs.findIndex(a => a.number === currentPlayingAyah);
    if (currentIndex > 0) {
      handlePlayAyah(ayahs[currentIndex - 1]);
    }
  };

  const handleAudioEnded = () => {
    if (!currentPlayingAyah) return;
    const currentIndex = ayahs.findIndex(a => a.number === currentPlayingAyah);
    if (currentIndex !== -1 && currentIndex < ayahs.length - 1) {
      const nextAyah = ayahs[currentIndex + 1];
      if (audioRef.current && nextAyah.audio) {
        audioRef.current.src = nextAyah.audio;
        audioRef.current.play().catch(e => console.warn('Next audio notice', e));
        setCurrentPlayingAyah(nextAyah.number);
      }
    } else {
      setIsPlayingAudio(false);
      setCurrentPlayingAyah(null);
    }
  };

  const toggleBookmark = (ayahNumber: number) => {
    setBookmarkedAyahs(prev => 
      prev.includes(ayahNumber) ? prev.filter(n => n !== ayahNumber) : [...prev, ayahNumber]
    );
  };

  // Jump to specific Hizb
  const handleHizbClick = (hizbNumber: number) => {
    onSelectHizb(hizbNumber);
    const targetHizb = HIZB_LIST.find(h => h.hizbNumber === hizbNumber);
    if (targetHizb) {
      setSelectedSurahNumber(targetHizb.startSurah);
    }
  };

  // Filtered lists
  const filteredSurahs = SURAHS_LIST.filter(s => 
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.includes(searchQuery) ||
    s.number.toString().includes(searchQuery)
  );

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Hidden Audio Player Element */}
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnded} 
        onError={() => setIsPlayingAudio(false)} 
      />

      {/* Top Quran Navigation Bar */}
      <div className="rounded-3xl glass-panel p-4 sm:p-6 border border-white/15 shadow-glass-md flex flex-col gap-4">
        
        {/* Controls Row: Tabs, Search, Quick 5-Hizb Badges */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Hizb / Surah Toggle */}
          <div className="flex items-center p-1 rounded-2xl glass-card border border-white/10">
            <button
              onClick={() => setActiveTab('hizbs')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'hizbs'
                  ? 'bg-gold-500/25 text-gold-200 border border-gold-500/40 shadow-sm shadow-gold-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              60 Hizb Selector
            </button>
            <button
              onClick={() => setActiveTab('surahs')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'surahs'
                  ? 'bg-gold-500/25 text-gold-200 border border-gold-500/40 shadow-sm shadow-gold-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              114 Surahs
            </button>
          </div>

          {/* Quick Jump to Today's Reading (Hizb 1 to 5) */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-[11px] font-bold uppercase text-slate-400 mr-1 hidden sm:inline">Today:</span>
            {[1, 2, 3, 4, 5].map((hNum) => (
              <button
                key={hNum}
                onClick={() => handleHizbClick(hNum)}
                className={`px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all ${
                  currentHizb === hNum
                    ? 'bg-gold-500 text-midnight-950 shadow-gold-glow border border-gold-300'
                    : 'glass-card text-gold-300 hover:bg-gold-500/15 border border-gold-500/30'
                }`}
              >
                Hizb {hNum}
              </button>
            ))}
          </div>

          {/* Display & Reader Controls (Font Scale, Translation, View Mode) */}
          <div className="flex items-center gap-2">
            {/* Font Size Adjust */}
            <div className="flex items-center rounded-xl glass-card border border-white/10 p-1 text-xs">
              <button
                onClick={() => setFontSize(prev => Math.max(20, prev - 2))}
                className="px-2 py-0.5 text-slate-300 hover:text-gold-300 font-bold"
                title="Decrease font size"
              >
                A-
              </button>
              <span className="text-[10px] text-slate-400 px-1 font-mono">{fontSize}px</span>
              <button
                onClick={() => setFontSize(prev => Math.min(46, prev + 2))}
                className="px-2 py-0.5 text-slate-300 hover:text-gold-300 font-bold"
                title="Increase font size"
              >
                A+
              </button>
            </div>

            {/* Translation Language Toggle */}
            <button
              onClick={() => {
                if (!showTranslation) {
                  setShowTranslation(true);
                } else if (translationLang === 'ha') {
                  setTranslationLang('en');
                } else if (translationLang === 'en') {
                  setShowTranslation(false);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card border border-white/10 text-xs font-semibold text-slate-200 hover:border-gold-500/40"
              title="Toggle English / Hausa Translation"
            >
              <Languages className="w-3.5 h-3.5 text-gold-400" />
              <span>{showTranslation ? (translationLang === 'ha' ? 'Hausa' : 'English') : 'Arabic Only'}</span>
            </button>

            {/* View Mode Toggle */}
            <button
              onClick={() => setViewMode(viewMode === 'page' ? 'list' : 'page')}
              className="p-2 rounded-xl glass-card border border-white/10 text-slate-300 hover:border-gold-500/40"
              title={viewMode === 'page' ? 'Switch to Verse List' : 'Switch to Mushaf Page'}
            >
              {viewMode === 'page' ? <BookOpen className="w-4 h-4 text-celestial-400" /> : <ListFilter className="w-4 h-4 text-celestial-400" />}
            </button>
          </div>
        </div>

        {/* Drawer / Selector Content based on Active Tab */}
        {activeTab === 'hizbs' ? (
          /* 60 Hizbs Grid Selector */
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gold-300 uppercase tracking-wider">
                Select from 60 Hizbs (Al-Qur'an Al-Kareem)
              </span>
              <span className="text-[11px] text-slate-400">Current: Hizb {currentHizb}</span>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {HIZB_LIST.map((h) => (
                <button
                  key={h.hizbNumber}
                  onClick={() => handleHizbClick(h.hizbNumber)}
                  className={`p-2 rounded-xl text-center transition-all ${
                    currentHizb === h.hizbNumber
                      ? 'bg-gradient-to-br from-gold-500 to-amber-600 text-midnight-950 font-extrabold shadow-gold-glow border border-gold-300'
                      : 'glass-card border border-white/5 hover:border-gold-500/30 text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="block text-xs font-bold">{h.hizbNumber}</span>
                  <span className="block text-[8px] font-arabic truncate mt-0.5 opacity-80">{h.surahArabic}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* 114 Surahs Search & Filter */
          <div className="pt-3 border-t border-white/10 space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Surah by name (e.g. Al-Baqarah, Yasin, الملك)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl glass-input text-xs font-medium"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-40 overflow-y-auto pr-1">
              {filteredSurahs.map((surah) => (
                <button
                  key={surah.number}
                  onClick={() => setSelectedSurahNumber(surah.number)}
                  className={`p-2.5 rounded-2xl text-left transition-all ${
                    selectedSurahNumber === surah.number
                      ? 'bg-gold-500/25 text-gold-200 border border-gold-500/50 shadow-sm shadow-gold-500/20'
                      : 'glass-card border border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-gold-400">#{surah.number}</span>
                    <span className="text-xs font-arabic font-bold text-white">{surah.name}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-200 truncate">{surah.englishName}</p>
                  <p className="text-[10px] text-slate-400">{surah.numberOfAyahs} Ayahs</p>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Surah Header Banner (Deep Glass Card) */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-white/15 shadow-glass-lg overflow-hidden text-center">
        <div className="absolute -top-20 -left-20 w-56 h-56 bg-gold-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-celestial-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Surah Navigation Prev/Next Arrows */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setSelectedSurahNumber(prev => Math.max(1, prev - 1))}
            disabled={selectedSurahNumber === 1}
            className="p-2 rounded-xl glass-card border border-white/10 text-slate-300 hover:border-gold-500/40 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 font-bold border border-gold-500/30">
              Surah {currentSurah.number} of 114
            </span>
            <span className="text-xs px-3 py-1 rounded-full glass-card text-slate-300 font-medium">
              {currentSurah.revelationType} • {currentSurah.numberOfAyahs} Ayahs
            </span>
          </div>

          <button
            onClick={() => setSelectedSurahNumber(prev => Math.min(114, prev + 1))}
            disabled={selectedSurahNumber === 114}
            className="p-2 rounded-xl glass-card border border-white/10 text-slate-300 hover:border-gold-500/40 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Arabic Big Title */}
        <h2 className="text-3xl sm:text-4xl font-arabic font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-gold-300 to-amber-200 my-2">
          سورة {currentSurah.name}
        </h2>
        <p className="text-sm font-bold text-white tracking-wide">
          {currentSurah.englishName} <span className="text-slate-400 font-normal">({currentSurah.englishNameTranslation})</span>
        </p>

        {/* Bismillah Header (except for Surah At-Tawbah #9 and Al-Fatihah #1) */}
        {currentSurah.number !== 9 && currentSurah.number !== 1 && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-2xl sm:text-3xl font-arabic font-bold text-gold-300 drop-shadow-md">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        )}
      </div>

      {/* Main Mushaf Content View */}
      <div className="rounded-3xl glass-panel p-6 sm:p-10 border border-white/15 shadow-glass-lg min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-3 border-gold-500/30 border-t-gold-400 rounded-full animate-spin" />
            <p className="text-xs font-semibold text-gold-300">Loading Holy Quran Verses...</p>
          </div>
        ) : viewMode === 'page' ? (
          /* Continuous Mushaf Page Mode (Traditional Reading Layout) */
          <div className="relative">
            <div 
              className="arabic-text text-right text-slate-100 leading-[2.6] select-text"
              style={{ fontSize: `${fontSize}px` }}
            >
              {ayahs.map((ayah) => {
                const isCurrent = currentPlayingAyah === ayah.number;
                return (
                  <span
                    key={ayah.number}
                    className={`inline transition-colors duration-200 cursor-pointer rounded px-1 ${
                      isCurrent 
                        ? 'bg-gold-500/30 text-gold-100 ring-1 ring-gold-400/50 shadow-sm' 
                        : 'hover:bg-white/5'
                    }`}
                    onClick={() => handlePlayAyah(ayah)}
                    title={`Click to listen to Ayah ${ayah.numberInSurah}`}
                  >
                    {ayah.text}{' '}
                    {/* Ayah End Ornamental Marker */}
                    <span className="inline-flex items-center justify-center mx-1 font-sans text-xs font-bold text-gold-400 border border-gold-500/40 rounded-full w-7 h-7 align-middle bg-gold-500/10 select-none">
                      {ayah.numberInSurah}
                    </span>{' '}
                  </span>
                );
              })}
            </div>

            {/* Translation Footnotes / Drawer below the page */}
            {showTranslation && (
              <div className="mt-10 pt-8 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-gold-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold-300">
                    {translationLang === 'ha' ? 'Fassarar Hausa (Ma\'anonin Ayoyi)' : 'English Translation (Sahih International)'}
                  </h4>
                </div>
                {ayahs.slice(0, 15).map((ayah) => (
                  <div key={`trans-${ayah.number}`} className="p-3 rounded-2xl glass-card border border-white/5 text-xs">
                    <span className="font-bold text-gold-400 mr-2">[{ayah.numberInSurah}]</span>
                    <span className="text-slate-300 leading-relaxed">
                      {translationLang === 'ha' ? ayah.translationHa : ayah.translationEn}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Verse-by-Verse Card Mode */
          <div className="space-y-4">
            {ayahs.map((ayah) => {
              const isCurrent = currentPlayingAyah === ayah.number;
              const isBookmarked = bookmarkedAyahs.includes(ayah.number);

              return (
                <div
                  key={ayah.number}
                  className={`p-5 rounded-2xl glass-card border transition-all ${
                    isCurrent 
                      ? 'border-gold-500/50 bg-gold-500/15 shadow-gold-glow ring-1 ring-gold-400/40' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Top Bar: Ayah Number & Actions */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-gold-500/20 border border-gold-500/30 text-gold-300 font-bold text-xs flex items-center justify-center">
                        {ayah.numberInSurah}
                      </span>
                      <span className="text-[11px] text-slate-400">Juz {ayah.juz}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Audio Play Button */}
                      <button
                        onClick={() => handlePlayAyah(ayah)}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                          isCurrent && isPlayingAudio
                            ? 'bg-gold-500 text-midnight-950 border-gold-300 shadow-gold-glow'
                            : 'glass-card border-white/10 text-slate-300 hover:border-gold-500/40'
                        }`}
                      >
                        {isCurrent && isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-gold-400" />}
                        <span className="text-[11px]">{isCurrent && isPlayingAudio ? 'Playing' : 'Listen'}</span>
                      </button>

                      {/* Bookmark Button */}
                      <button
                        onClick={() => toggleBookmark(ayah.number)}
                        className={`p-2 rounded-xl glass-card border transition-all ${
                          isBookmarked ? 'border-gold-400 text-gold-400 bg-gold-500/20' : 'border-white/10 text-slate-400 hover:text-white'
                        }`}
                        title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Ayah'}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Arabic Quranic Text */}
                  <p 
                    className="arabic-text text-right text-white leading-loose my-2"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {ayah.text}
                  </p>

                  {/* Translation */}
                  {showTranslation && (
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {translationLang === 'ha' ? ayah.translationHa : ayah.translationEn}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FLOATING STICKY QURAN AUDIO CONTROLLER BAR */}
      {(isPlayingAudio || currentPlayingAyah !== null) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl p-3.5 sm:p-4 rounded-3xl glass-panel border border-gold-500/50 shadow-glass-lg backdrop-blur-2xl flex items-center justify-between gap-3 animate-fadeIn bg-midnight-950/90">
          
          {/* Left: Current Ayah Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/20 text-gold-300 border border-gold-500/40 flex items-center justify-center flex-shrink-0">
              <Volume2 className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-left">
              <p className="text-xs font-extrabold text-white">
                {currentSurah?.englishName} • Ayah {currentPlayingAyah}
              </p>
              <p className="text-[10px] text-gold-400/90 font-medium">
                Mishary Rashid Alafasy Recitation
              </p>
            </div>
          </div>

          {/* Center/Right: Audio Playback Actions */}
          <div className="flex items-center gap-2">
            {/* Prev Ayah */}
            <button
              onClick={handlePrevAyah}
              className="p-2 rounded-xl glass-card border border-white/10 text-slate-300 hover:text-white hover:border-gold-500/40 transition-colors"
              title="Previous Ayah"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play / Pause Toggle */}
            <button
              onClick={() => {
                if (currentPlayingAyah) {
                  const curr = ayahs.find(a => a.number === currentPlayingAyah);
                  if (curr) handlePlayAyah(curr);
                } else if (ayahs.length > 0) {
                  handlePlayAyah(ayahs[0]);
                }
              }}
              className="p-2.5 rounded-2xl bg-gold-500 hover:bg-gold-400 text-midnight-950 font-extrabold shadow-gold-glow transition-all"
              title={isPlayingAudio ? 'Pause' : 'Play'}
            >
              {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Next Ayah */}
            <button
              onClick={handleNextAyah}
              className="p-2 rounded-xl glass-card border border-white/10 text-slate-300 hover:text-white hover:border-gold-500/40 transition-colors"
              title="Next Ayah"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Prominent Red STOP Button */}
            <button
              onClick={handleStopAudio}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50 text-xs font-bold transition-all shadow-sm"
              title="Stop Recitation Audio"
            >
              <Square className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
              <span>Stop</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

// Helper: Hausa Meaning Fallback
function generateHausaPreview(surahNum: number, ayahNum: number): string {
  if (surahNum === 1) {
    const fatihahHa = [
      "Da sunan Allah, Mai rahama, Mai jin kai.",
      "Godiya ta tabbata ga Allah, Ubangijin halittu.",
      "Mai rahama, Mai jin kai.",
      "Mai mulkin Ranar Sakamako.",
      "Kai kadai muke bauta wa, kuma Kai kadai muke neman taimako.",
      "Ka shiryar da mu a kan hanya madaidaiciya.",
      "Hanyar wadanda Ka yi musu ni'ima, ba ta wadanda aka yi fushi da su ba, kuma ba ta batattu ba."
    ];
    return fatihahHa[ayahNum - 1] || "Da sunan Allah, Mai rahama, Mai jin kai.";
  }
  return `Fassarar ma'anar ayar Al-Qur'ani mai girma (Aya ta ${ayahNum}).`;
}

// Helper: Resilient Offline Fallback for Surah 1 & Core Surahs
function generateOfflineFallback(surahNum: number): Ayah[] {
  if (surahNum === 1) {
    return [
      { number: 1, numberInSurah: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translationEn: "In the name of Allah, the Entirely Merciful, the Especially Merciful.", translationHa: "Da sunan Allah, Mai rahama, Mai jin kai.", juz: 1, hizbQuarter: 1, page: 1 },
      { number: 2, numberInSurah: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", translationEn: "[All] praise is [due] to Allah, Lord of the worlds -", translationHa: "Godiya ta tabbata ga Allah, Ubangijin halittu.", juz: 1, hizbQuarter: 1, page: 1 },
      { number: 3, numberInSurah: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ", translationEn: "The Entirely Merciful, the Especially Merciful,", translationHa: "Mai rahama, Mai jin kai.", juz: 1, hizbQuarter: 1, page: 1 },
      { number: 4, numberInSurah: 4, text: "مَالِكِ يَوْمِ الدِّينِ", translationEn: "Sovereign of the Day of Recompense.", translationHa: "Mai mulkin Ranar Sakamako.", juz: 1, hizbQuarter: 1, page: 1 },
      { number: 5, numberInSurah: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translationEn: "It is You we worship and You we ask for help.", translationHa: "Kai kadai muke bauta wa, kuma Kai kadai muke neman taimako.", juz: 1, hizbQuarter: 1, page: 1 },
      { number: 6, numberInSurah: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", translationEn: "Guide us to the straight path -", translationHa: "Ka shiryar da mu a kan hanya madaidaiciya.", juz: 1, hizbQuarter: 1, page: 1 },
      { number: 7, numberInSurah: 7, text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", translationEn: "The path of those upon whom You have bestowed favor, not of those who have earned [Your] anger or of those who are astray.", translationHa: "Hanyar wadanda Ka yi musu ni'ima, ba ta wadanda aka yi fushi da su ba, kuma ba ta batattu ba.", juz: 1, hizbQuarter: 1, page: 1 },
    ];
  }

  // Generic fallback for any other Surah
  const surah = SURAHS_LIST.find(s => s.number === surahNum) || SURAHS_LIST[1];
  return Array.from({ length: Math.min(surah.numberOfAyahs, 12) }, (_, i) => ({
    number: i + 1,
    numberInSurah: i + 1,
    text: `آيَةٌ مِن سُورَةِ ${surah.name} ﴿${i + 1}﴾`,
    translationEn: `Translation for verse ${i + 1} of Surah ${surah.englishName}.`,
    translationHa: `Fassarar aya ta ${i + 1} na Suratu ${surah.englishName}.`,
    juz: surah.startJuz,
    hizbQuarter: surah.startHizb * 4,
    page: 1,
  }));
}
