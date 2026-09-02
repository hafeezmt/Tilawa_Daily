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
import { RECITERS_LIST } from '../data/reciters';
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
  const [selectedReciter, setSelectedReciter] = useState('ar.alafasy');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Bookmarks
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<number[]>(() => {
    const saved = localStorage.getItem('tilawa_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('tilawa_bookmarks', JSON.stringify(bookmarkedAyahs));
  }, [bookmarkedAyahs]);

  // Fetch Ayahs from Quran.com API or resilient fallback
  useEffect(() => {
    let isMounted = true;
    const fetchSurah = async () => {
      setIsLoading(true);
      try {
        const arabicRes = await fetch(
          `https://api.alquran.cloud/v1/surah/${selectedSurahNumber}/${selectedReciter}`
        );
        const arabicData = await arabicRes.json();

        const enRes = await fetch(
          `https://api.alquran.cloud/v1/surah/${selectedSurahNumber}/en.sahih`
        );
        const enData = await enRes.json();

        if (isMounted && arabicData.code === 200 && enData.code === 200) {
          const combinedAyahs: Ayah[] = arabicData.data.ayahs.map((ayah: any, index: number) => ({
            number: ayah.number,
            numberInSurah: ayah.numberInSurah,
            text: ayah.text,
            translationEn: enData.data.ayahs[index]?.text || '',
            translationHa: generateHausaPreview(selectedSurahNumber, ayah.numberInSurah),
            juz: ayah.juz,
            hizbQuarter: ayah.hizbQuarter,
            page: ayah.page,
            audio: ayah.audio || `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`
          }));
          setAyahs(combinedAyahs);
        } else {
          setAyahs(generateOfflineFallback(selectedSurahNumber));
        }
      } catch (err) {
        console.warn('API fetch notice, using offline fallback', err);
        if (isMounted) {
          setAyahs(generateOfflineFallback(selectedSurahNumber));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchSurah();

    return () => {
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.pause();
      }
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

  const currentSurah = SURAHS_LIST.find(s => s.number === selectedSurahNumber) || SURAHS_LIST[0];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Hidden Audio Player Element */}
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnded} 
        preload="none"
      />

      {/* TOP QURAN NAVIGATION CONTROLS BAR (White & Gold) */}
      <div className="rounded-3xl bg-white p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
        
        {/* Row 1: Search & Tab Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Surah / Hizb Mode Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('hizbs')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'hizbs'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>5-Hizb Index (60 Hizbs)</span>
            </button>

            <button
              onClick={() => setActiveTab('surahs')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'surahs'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Surahs Index (114)</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Surah by name or #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900"
            />
          </div>

        </div>

        {/* Row 2: Display Preferences */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          
          {/* Reciter Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 hidden sm:inline">Qari / Reciter:</span>
            <select
              value={selectedReciter}
              onChange={(e) => setSelectedReciter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-amber-800 cursor-pointer"
            >
              {RECITERS_LIST.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.style})
                </option>
              ))}
            </select>
          </div>

          {/* Font Size Slider */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Arabic Size:</span>
            <input
              type="range"
              min="22"
              max="42"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-24 accent-amber-600 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-amber-800">{fontSize}px</span>
          </div>

          {/* Translation Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                showTranslation 
                  ? 'bg-amber-50 text-amber-800 border-amber-300' 
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <Languages className="w-3.5 h-3.5 text-amber-600" />
              <span>Translation {showTranslation ? 'ON' : 'OFF'}</span>
            </button>

            {showTranslation && (
              <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setTranslationLang('ha')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    translationLang === 'ha' ? 'bg-amber-600 text-white' : 'text-slate-600'
                  }`}
                >
                  Hausa
                </button>
                <button
                  onClick={() => setTranslationLang('en')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    translationLang === 'en' ? 'bg-amber-600 text-white' : 'text-slate-600'
                  }`}
                >
                  English
                </button>
              </div>
            )}
          </div>

          {/* View Mode (Page vs List) */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setViewMode('page')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'page' ? 'bg-amber-600 text-white' : 'text-slate-600'
              }`}
            >
              Mushaf Mode
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-amber-600 text-white' : 'text-slate-600'
              }`}
            >
              Ayah List
            </button>
          </div>

        </div>

        {/* 60 HIZB HORIZONTAL SELECTOR BAR */}
        {activeTab === 'hizbs' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
            {HIZB_LIST.map((hizb) => {
              const isSelected = hizb.startSurah === selectedSurahNumber;
              return (
                <button
                  key={hizb.hizbNumber}
                  onClick={() => handleHizbClick(hizb.hizbNumber)}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-2xl border text-xs font-bold flex flex-col items-center gap-0.5 transition-all ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-amber-400'
                  }`}
                >
                  <span>Hizb {hizb.hizbNumber}</span>
                  <span className="text-[10px] font-arabic opacity-90">{hizb.surahArabic}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* SURAHS GRID (If Surahs tab active) */}
        {activeTab === 'surahs' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
            {filteredSurahs.map((surah) => (
              <button
                key={surah.number}
                onClick={() => setSelectedSurahNumber(surah.number)}
                className={`p-2 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                  selectedSurahNumber === surah.number
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-amber-400'
                }`}
              >
                <div>
                  <span className="text-[10px] opacity-75 font-mono">#{surah.number} </span>
                  <span>{surah.englishName}</span>
                </div>
                <span className="font-arabic text-sm">{surah.name}</span>
              </button>
            ))}
          </div>
        )}

      </div>

      {/* SURAH TITLE CARD */}
      <div className="relative rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-sm text-center">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setSelectedSurahNumber(prev => Math.max(1, prev - 1))}
            disabled={selectedSurahNumber === 1}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
              Surah {currentSurah.number} of 114 • {currentSurah.revelationType} • {currentSurah.numberOfAyahs} Ayahs
            </span>
            <h2 className="text-3xl sm:text-4xl font-arabic font-extrabold text-slate-900 my-1">
              سورة {currentSurah.name}
            </h2>
            <p className="text-sm font-extrabold text-amber-800">
              {currentSurah.englishName} ({currentSurah.englishNameTranslation})
            </p>
          </div>

          <button
            onClick={() => setSelectedSurahNumber(prev => Math.min(114, prev + 1))}
            disabled={selectedSurahNumber === 114}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MUSHAF PAGES CONTAINER (Clean White Printed Page Layout) */}
      <div className="rounded-3xl bg-white p-6 sm:p-10 border border-slate-200 shadow-md min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-600">Loading Arabic verses...</p>
          </div>
        ) : viewMode === 'page' ? (
          /* MUSHAF CONTINUOUS FLOW VIEW */
          <div className="space-y-6">
            
            {/* Bismillah Banner */}
            {selectedSurahNumber !== 9 && selectedSurahNumber !== 1 && (
              <div className="py-4 text-center border-b border-slate-100 mb-6">
                <p className="arabic-text text-2xl sm:text-3xl font-bold text-slate-900">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
              </div>
            )}

            <div className="text-right leading-loose flex flex-wrap flex-row-reverse items-center justify-start gap-y-4 gap-x-2">
              {ayahs.map((ayah) => {
                const isCurrent = currentPlayingAyah === ayah.number;
                const isBookmarked = bookmarkedAyahs.includes(ayah.number);

                return (
                  <span
                    key={ayah.number}
                    className={`inline-flex items-center flex-row-reverse gap-2 p-1.5 rounded-2xl transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-100 border border-amber-300'
                        : isBookmarked
                        ? 'bg-amber-50'
                        : 'hover:bg-slate-50'
                    }`}
                    onClick={() => handlePlayAyah(ayah)}
                    title="Click to Listen"
                  >
                    {/* Arabic Verse Text */}
                    <span 
                      className="arabic-text text-slate-900 font-medium"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {ayah.text}
                    </span>

                    {/* Ayah End Symbol */}
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-arabic font-extrabold flex-shrink-0 mx-1">
                      {ayah.numberInSurah}
                    </span>
                  </span>
                );
              })}
            </div>

            {/* Translation Footnote Section */}
            {showTranslation && (
              <div className="mt-8 pt-6 border-t border-slate-200 text-left space-y-3">
                <h4 className="text-xs font-extrabold uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{translationLang === 'ha' ? "FASSARAR HAUSA (MA'ANONIN AYOYI)" : "ENGLISH TRANSLATION (SAHIH INTERNATIONAL)"}</span>
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {ayahs.map((ayah) => (
                    <p key={ayah.number} className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-bold text-amber-800">[{ayah.numberInSurah}]</span> {translationLang === 'ha' ? ayah.translationHa : ayah.translationEn}
                    </p>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          /* AYAH LIST VIEW */
          <div className="space-y-4 text-left">
            {ayahs.map((ayah) => {
              const isCurrent = currentPlayingAyah === ayah.number;
              const isBookmarked = bookmarkedAyahs.includes(ayah.number);

              return (
                <div
                  key={ayah.number}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'border-amber-400 bg-amber-50/50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center justify-center border border-amber-200">
                      {ayah.numberInSurah}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Play Button */}
                      <button
                        onClick={() => handlePlayAyah(ayah)}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                          isCurrent && isPlayingAudio
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-amber-400'
                        }`}
                      >
                        {isCurrent && isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-amber-600" />}
                        <span className="text-[11px]">{isCurrent && isPlayingAudio ? 'Playing' : 'Listen'}</span>
                      </button>

                      {/* Bookmark Button */}
                      <button
                        onClick={() => toggleBookmark(ayah.number)}
                        className={`p-2 rounded-xl border transition-all ${
                          isBookmarked ? 'border-amber-400 text-amber-700 bg-amber-50' : 'border-slate-200 text-slate-400 hover:text-slate-800'
                        }`}
                        title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Ayah'}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Arabic Quranic Text */}
                  <p 
                    className="arabic-text text-right text-slate-900 leading-loose my-2"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {ayah.text}
                  </p>

                  {/* Translation */}
                  {showTranslation && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
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

      {/* FLOATING QURAN AUDIO CONTROLLER BAR (White & Gold, Zero Color Shadows) */}
      {(isPlayingAudio || currentPlayingAyah !== null) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl p-3.5 sm:p-4 rounded-3xl bg-white border border-slate-200 shadow-xl flex items-center justify-between gap-3 animate-fadeIn">
          
          {/* Left: Current Ayah Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center flex-shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-extrabold text-slate-900">
                {currentSurah?.englishName} • Ayah {currentPlayingAyah}
              </p>
              <p className="text-[10px] text-amber-700 font-medium">
                Mishary Rashid Alafasy Recitation
              </p>
            </div>
          </div>

          {/* Center/Right: Audio Playback Actions */}
          <div className="flex items-center gap-2">
            {/* Prev Ayah */}
            <button
              onClick={handlePrevAyah}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
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
              className="p-2.5 rounded-2xl bg-amber-600 text-white font-extrabold hover:bg-amber-700 shadow-sm"
              title={isPlayingAudio ? 'Pause' : 'Play'}
            >
              {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Next Ayah */}
            <button
              onClick={handleNextAyah}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
              title="Next Ayah"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Red STOP Button */}
            <button
              onClick={handleStopAudio}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100 shadow-sm"
              title="Stop Recitation Audio"
            >
              <Square className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
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
