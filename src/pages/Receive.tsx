import React from 'react';
import { Download, CheckCircle2, Clock, Inbox } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FileTransfer } from '../db';

export default function Receive() {
  const { incomingTransfers } = useAppContext();
  
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
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-bold tracking-tight">Incoming Files</h2>
        {incomingTransfers.length > 0 && (
           <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
             {incomingTransfers.length} Pending
           </span>
        )}
      </div>

      {incomingTransfers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white/50 backdrop-blur-xl border border-gray-200/50 rounded-3xl">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Your inbox is empty</h3>
          <p className="text-gray-500 text-sm max-w-sm">When someone sends you a file, it will appear here for you to accept and download securely.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incomingTransfers.map(t => (
            <div key={t.id} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 shadow-sm flex flex-col gap-5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100 shrink-0">
                    <span className="font-bold text-indigo-600">{t.senderName.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 leading-tight">{t.senderName}</div>
                    <div className="text-xs text-gray-500">Sent a file</div>
                  </div>
                </div>
                {t.status === 'accepted' && (
                  <div className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                     <Download className="w-5 h-5 text-gray-600" />
                   </div>
                   <div className="min-w-0">
                      <div className="font-semibold text-gray-900 text-sm break-all">{t.fileName}</div>
                      <div className="text-xs text-gray-500 font-medium mt-1">{(t.fileSize / 1024 / 1024).toFixed(2)} MB</div>
                   </div>
                </div>
              </div>
              
              {t.status === 'pending' && (
                <div className="flex gap-3 mt-auto">
                  <button 
                    onClick={() => handleRejectTransfer(t)}
                    className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 text-sm font-semibold py-2.5 rounded-xl transition-all active:scale-[0.98]"
                  >
                    Decline
                  </button>
                  <button 
                    onClick={() => handleAcceptTransfer(t)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all active:scale-[0.98] shadow-sm shadow-indigo-600/20"
                  >
                    Accept & Download
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
