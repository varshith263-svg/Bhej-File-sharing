import React from 'react';
import { Download, CheckCircle2, Inbox, X } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FileTransfer } from '../db';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function GlobalTransferToast() {
  const { incomingTransfers } = useAppContext();
  const location = useLocation();

  // If on receive page, we don't necessarily need to hide it, but maybe better to hide?
  // Let's hide it if they are on the receive page
  if (location.pathname === '/receive') return null;

  const pendingTransfers = incomingTransfers.filter(t => t.status === 'pending');

  if (pendingTransfers.length === 0) return null;

  const handleAcceptTransfer = async (t: FileTransfer) => {
    try {
      await updateDoc(doc(db, 'transfers', t.id), { status: 'accepted' });
      
      const a = document.createElement('a');
      a.href = t.downloadUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = t.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      await updateDoc(doc(db, 'transfers', t.id), { status: 'completed' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectTransfer = async (t: FileTransfer) => {
    try {
      await updateDoc(doc(db, 'transfers', t.id), { status: 'rejected' });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 md:right-8 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {pendingTransfers.slice(0, 3).map(t => (
          <motion.div 
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-sm bg-white/90 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/60 shadow-xl pointer-events-auto"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100 shrink-0">
                <span className="font-bold text-indigo-600">{t.senderName.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 leading-tight truncate">{t.senderName} sent you a file</div>
                <div className="text-xs text-gray-500 font-medium truncate">{t.fileName} ({(t.fileSize / 1024 / 1024).toFixed(2)} MB)</div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button 
                onClick={() => handleRejectTransfer(t)}
                className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold py-2 rounded-xl transition-colors"
              >
                Decline
              </button>
              <button 
                onClick={() => handleAcceptTransfer(t)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors shadow-sm shadow-indigo-600/20"
              >
                Accept & Download
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {pendingTransfers.length > 3 && (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-2 text-center text-xs font-semibold text-gray-500 pointer-events-auto">
          + {pendingTransfers.length - 3} more pending
        </div>
      )}
    </div>
  );
}
