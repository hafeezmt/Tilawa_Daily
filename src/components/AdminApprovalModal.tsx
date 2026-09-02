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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-xl relative overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Member Approval Management</h3>
              <p className="text-xs text-slate-500">
                {pendingMembers.length} pending review • {approvedMembers.length} verified members
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pending Applications List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2">
          {pendingMembers.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-900">All Applications Reviewed!</p>
              <p className="text-xs text-slate-500 mt-1">There are no pending membership requests waiting for approval.</p>
            </div>
          ) : (
            pendingMembers.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center border border-amber-300 flex-shrink-0">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-slate-900">{member.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-bold uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1.5">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-amber-600" />
                        {member.phone || 'No phone'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-amber-600" />
                        {member.email}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        {member.location || 'Nigeria'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => rejectMember(member.id)}
                    className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-100 transition-colors"
                  >
                    <UserX className="w-4 h-4" />
                    <span>Decline</span>
                  </button>

                  <button
                    onClick={() => approveMember(member.id)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition-all"
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
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Ustadh / Admin Security Panel</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 shadow-sm"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
