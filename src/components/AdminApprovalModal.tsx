import React from 'react';
import { 
  X, 
  UserCheck, 
  UserX, 
  Clock, 
  Shield, 
  Phone, 
  MapPin, 
  Mail, 
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminApprovalModal: React.FC<AdminApprovalModalProps> = ({ isOpen, onClose }) => {
  const { pendingMembers, allMembers, approveMember, rejectMember } = useAuth();

  if (!isOpen) return null;

  const approvedMembers = allMembers.filter(m => m.status === 'approved');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-midnight-950/85 backdrop-blur-2xl animate-fadeIn">
      <div 
        className="w-full max-w-2xl rounded-3xl glass-panel p-6 sm:p-8 border border-white/20 shadow-glass-lg relative overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gold-500/20 text-gold-300 border border-gold-500/40">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Member Approval Management</h3>
              <p className="text-xs text-slate-400">
                {pendingMembers.length} pending review • {approvedMembers.length} verified members
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

        {/* Pending Applications List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2">
          {pendingMembers.length === 0 ? (
            <div className="py-12 text-center glass-card rounded-2xl border border-white/5">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">All Applications Reviewed!</p>
              <p className="text-xs text-slate-400 mt-1">There are no pending membership requests waiting for approval.</p>
            </div>
          ) : (
            pendingMembers.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-2xl glass-card border border-gold-500/30 bg-gold-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-gold-500/20 text-gold-300 font-extrabold flex items-center justify-center border border-gold-500/40 flex-shrink-0">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-white">{member.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-1.5">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-gold-400" />
                        {member.phone || 'No phone'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-celestial-400" />
                        {member.email}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {member.location || 'Nigeria'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => rejectMember(member.id)}
                    className="px-3 py-2 rounded-xl glass-card border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-500/10 transition-colors"
                  >
                    <UserX className="w-4 h-4" />
                    <span>Decline</span>
                  </button>

                  <button
                    onClick={() => approveMember(member.id)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-extrabold shadow-emerald-glow flex items-center gap-1.5 transition-all"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Approve Member</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Ustadh / Admin Security Panel</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gold-500 text-midnight-950 font-bold text-xs shadow-gold-glow hover:bg-gold-400"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
