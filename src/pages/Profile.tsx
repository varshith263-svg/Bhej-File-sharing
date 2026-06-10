import React, { useState } from 'react';
import { User, LogOut, Shield, Edit2, Check, X } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { updateProfileInfo } from '../db';

export default function Profile() {
  const { profile, logout, refreshProfile } = useAppContext();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!profile) return null;

  const handleEditClick = () => {
    setEditName(profile.name);
    setEditUsername(profile.username);
    setIsEditing(true);
    setError('');
  };

  const handleSave = async () => {
    if (!editName.trim() || !editUsername.trim()) {
      setError('Name and username cannot be empty.');
      return;
    }
    const cleanUsername = editUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanUsername.length < 3) {
      setError('Username must be at least 3 characters and contain only letters, numbers, and underscores.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await updateProfileInfo(profile.uid, editName.trim(), cleanUsername);
      await refreshProfile();
      setIsEditing(false);
    } catch (e: any) {
      setError(e.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-bold tracking-tight">Your Profile</h2>
        {!isEditing && (
          <button 
            onClick={handleEditClick}
            className="flex items-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Edit2 className="w-4 h-4" /> Edit
          </button>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 shadow-sm flex flex-col items-center text-center">
        <div className="relative mb-4">
          <img 
            src={profile.photoURL || 'https://ui-avatars.com/api/?name='+profile.name+'&background=random'} 
            alt={profile.name} 
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
          />
        </div>
        
        {isEditing ? (
          <div className="w-full max-w-sm space-y-4 mb-6">
            {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</div>}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 text-left">Display Name</label>
              <input 
                type="text" 
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 text-left">Username</label>
              <input 
                type="text" 
                value={editUsername}
                onChange={e => setEditUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-4 py-2.5 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 font-semibold transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{profile.name}</h3>
            <p className="text-gray-500 font-medium mb-6">@{profile.username}</p>
          </>
        )}
        
        <div className="w-full flex flex-col gap-3 mb-8">
           <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
             <div className="text-left">
               <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Unique ID</div>
               <div className="font-mono text-gray-900 font-medium tracking-widest">{profile.searchId}</div>
             </div>
             <button
               onClick={() => navigator.clipboard.writeText(profile.searchId)}
               className="text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition-colors"
             >
               Copy
             </button>
           </div>

           <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-start border border-gray-100">
             <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Email Address</div>
             <div className="text-gray-900 font-medium truncate w-full text-left">{profile.email}</div>
           </div>
        </div>

        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl px-4 py-3.5 font-semibold transition-colors active:scale-[0.98]"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      <div className="px-2">
        <div className="flex items-start gap-3 mt-8">
           <Shield className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
           <p className="text-xs text-gray-500 leading-relaxed">
             Bhej transfers files using your Google Drive connection. Files are directly uploaded to your Drive and a secure access link is shared with the receiver. 
           </p>
        </div>
      </div>
    </div>
  );
}
