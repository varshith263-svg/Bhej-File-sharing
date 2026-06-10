import React from 'react';
import { Send, Download, ArrowRight, Clock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';

export default function Home() {
  const navigate = useNavigate();
  const { incomingTransfers, activeTransfers } = useAppContext();

  const pendingIncomingCount = incomingTransfers.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Section */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-[32px] p-6 lg:p-10 border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="absolute -right-32 -top-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -left-32 -bottom-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex-1 w-full max-w-xl">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4 leading-tight">
            Seamless file <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">transfers.</span>
          </h1>
          <p className="text-gray-500 text-[15px] max-w-md leading-relaxed mb-8">
            Send large files directly to peers using your Google Drive connection. Fast, secure, and privacy-first.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate('/send')}
              className="flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl px-6 py-4 font-semibold transition-all active:scale-[0.98] shadow-sm shadow-gray-900/20 w-full sm:w-auto"
            >
              <Send className="w-5 h-5" />
              Send File
            </button>
            <button 
              onClick={() => navigate('/receive')}
              className="flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl px-6 py-4 font-semibold transition-all active:scale-[0.98] w-full sm:w-auto relative"
            >
              <Download className="w-5 h-5 text-gray-600" />
              Receive
              {pendingIncomingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 flex items-center justify-center text-[11px] font-bold text-white bg-indigo-500 border-2 border-white rounded-full">
                  {pendingIncomingCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Abstract Illustration */}
        <div className="relative z-10 hidden md:flex items-center justify-center p-8 shrink-0">
           <div className="relative w-48 h-48">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-blue-50 rounded-3xl transform rotate-6 border border-white/50 shadow-sm" />
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-3xl -rotate-6 border border-gray-100/50 shadow-xl shadow-indigo-900/5 flex items-center justify-center p-6">
                 <div className="text-center space-y-4 w-full">
                   <div className="flex justify-between items-center px-2">
                     <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                       <Send className="w-5 h-5 text-indigo-600" />
                     </div>
                     <ArrowRight className="w-5 h-5 text-gray-300" />
                     <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                       <Download className="w-5 h-5 text-blue-600" />
                     </div>
                   </div>
                   <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                     <div className="w-2/3 h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full animate-pulse" />
                   </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Outgoing Detailed View */}
        <div className="bg-white/60 backdrop-blur-2xl border border-gray-200/50 rounded-[32px] p-6 lg:p-8 shadow-sm">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                Active Transfers
             </h3>
             <button onClick={() => navigate('/send')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</button>
           </div>
           
           <div className="space-y-3">
             {activeTransfers.slice(0, 4).map(t => (
               <div key={t.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-4 min-w-0 pr-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shrink-0">
                      <FileText className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-gray-900 truncate">{t.fileName}</div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate hidden sm:block">Receiver: {t.receiverId}</div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className={`text-[11px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg whitespace-nowrap ${t.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {t.status}
                    </span>
                  </div>
               </div>
             ))}
             {activeTransfers.length === 0 && (
               <div className="text-sm text-gray-400 py-10 text-center bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed">
                 No active transfers at the moment.<br/>
                 <span className="text-xs mt-1 block">Click 'Send File' to start sharing.</span>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
