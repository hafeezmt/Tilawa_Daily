import React from 'react';
import { 
  X, 
  Users, 
  Mic, 
  MicOff, 
  Shield, 
  Hand, 
  Sparkles,
  UserCheck
} from 'lucide-react';
import { RoomParticipant } from '../services/voiceRoomService';
import { UserProfile } from '../types';

interface ParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: RoomParticipant[];
  currentUser: UserProfile | null;
  onMakeReciter?: (user: UserProfile) => void;
}

export const ParticipantsModal: React.FC<ParticipantsModalProps> = ({
  isOpen,
  onClose,
  participants,
  currentUser,
  onMakeReciter,
}) => {
  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'ustadh' || currentUser?.role === 'admin';

  // Fallback demo participants if only 1 person is testing alone
  const displayList: RoomParticipant[] = participants.length > 0 ? participants : [
    {
      peerId: 'self',
      user: currentUser || {
        id: '1',
        name: 'You',
        email: 'you@tilawa.com',
        role: 'member',
        provider: 'google',
        hizbsRecited: 4,
        streakDays: 3,
        bookmarks: [],
        joinedDate: 'Joined Today'
      },
      isMuted: true,
      isSpeaking: false,
      isHandRaised: false,
    },
    {
      peerId: 'p-1',
      user: {
        id: '2',
        name: 'Ustadh Mansur Al-Hassan',
        email: 'mansur@tilawa.com',
        role: 'ustadh',
        provider: 'google',
        hizbsRecited: 42,
        streakDays: 14,
        bookmarks: [],
        joinedDate: 'Lead Moderator'
      },
      isMuted: false,
      isSpeaking: true,
      isHandRaised: false,
    },
    {
      peerId: 'p-2',
      user: {
        id: '3',
        name: 'Abubakar Sani (Kano)',
        email: 'sani@tilawa.com',
        role: 'member',
        provider: 'email',
        hizbsRecited: 12,
        streakDays: 5,
        bookmarks: [],
        joinedDate: 'Member'
      },
      isMuted: true,
      isSpeaking: false,
      isHandRaised: true,
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-midnight-950/85 backdrop-blur-xl animate-fadeIn">
      <div 
        className="w-full max-w-lg rounded-3xl glass-panel p-6 sm:p-8 border border-white/20 shadow-glass-lg relative overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gold-500/20 text-gold-300 border border-gold-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Live Room Participants</h3>
              <p className="text-xs text-slate-400">
                {displayList.length} active in Tilawa Daily Voice Halaqah
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl glass-card border border-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Participants Scroll List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 my-2">
          {displayList.map((participant, idx) => {
            const isMe = participant.user.id === currentUser?.id || participant.peerId === 'self';
            return (
              <div
                key={participant.peerId || idx}
                className={`p-3.5 rounded-2xl glass-card border flex items-center justify-between transition-all ${
                  participant.isSpeaking
                    ? 'border-gold-400 bg-gold-500/10 shadow-gold-glow'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-midnight-900 border border-gold-500/40 flex items-center justify-center text-sm font-extrabold text-gold-300 shadow-sm">
                      {participant.user.name.charAt(0).toUpperCase()}
                    </div>
                    {participant.isSpeaking && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-midnight-950 animate-ping" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white">
                        {participant.user.name}
                      </p>
                      {isMe && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-gold-500/30 text-gold-200 uppercase font-extrabold">You</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        participant.user.role === 'ustadh' || participant.user.role === 'admin'
                          ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                          : 'bg-slate-700/50 text-slate-300'
                      }`}>
                        {participant.user.role === 'ustadh' ? 'Ustadh' : 'Reciter'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {participant.user.hizbsRecited || 0} Hizbs read
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Icons & Ustadh Actions */}
                <div className="flex items-center gap-2">
                  {participant.isHandRaised && (
                    <span className="p-1.5 rounded-lg bg-gold-500/20 text-gold-300 border border-gold-500/40" title="Hand Raised">
                      <Hand className="w-3.5 h-3.5 animate-bounce" />
                    </span>
                  )}

                  <span className={`p-1.5 rounded-lg border ${
                    participant.isMuted 
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {participant.isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 animate-pulse" />}
                  </span>

                  {isAdmin && !isMe && onMakeReciter && (
                    <button
                      onClick={() => onMakeReciter(participant.user)}
                      className="px-2 py-1 rounded-lg bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-500/40 text-[10px] font-bold flex items-center gap-1"
                      title="Give Mic to this member"
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>Give Mic</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>High-definition WebRTC voice encryption</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gold-500 text-midnight-950 font-bold text-xs shadow-gold-glow hover:bg-gold-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
