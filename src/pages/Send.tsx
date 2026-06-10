import React, { useState, useEffect } from "react";
import {
  Search,
  UploadCloud,
  FileIcon,
  XCircle,
  Clock,
  Send as SendIcon,
  UserPlus,
  Check,
  X,
} from "lucide-react";
import { useAppContext } from "../AppContext";
import {
  searchUsers,
  UserProfile,
  FileTransfer,
  generateSearchId,
} from "../db";
import { uploadFileToDrive } from "../drive";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function Send() {
  const { profile, token, activeTransfers } = useAppContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length >= 1) {
        setIsSearching(true);
        try {
          const res = await searchUsers(searchTerm);
          setSearchResults(res.filter((u) => u.uid !== profile?.uid));
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, profile]);

  const toggleUserSelection = (user: UserProfile) => {
    if (selectedUsers.find((u) => u.uid === user.uid)) {
      setSelectedUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    } else {
      setSelectedUsers((prev) => [...prev, user]);
      setSearchTerm("");
      setSearchResults([]);
      setTimeout(() => {
        const input = document.getElementById(
          "recipient-search-input",
        ) as HTMLInputElement;
        if (input) input.focus();
      }, 0);
    }
  };

  const removeUser = (uid: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.uid !== uid));
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendFiles = async () => {
    if (
      selectedUsers.length === 0 ||
      selectedFiles.length === 0 ||
      !profile ||
      !token
    )
      return;

    try {
      setUploading(true);

      for (const file of selectedFiles) {
        const { fileId, downloadUrl } = await uploadFileToDrive(file, token);

        for (const user of selectedUsers) {
          const transferId =
            Math.random().toString(36).substring(2) + Date.now().toString(36);
          const transferData: FileTransfer = {
            id: transferId,
            senderId: profile.uid,
            senderName: profile.name,
            receiverId: user.uid,
            fileId,
            fileName: file.name,
            fileSize: file.size,
            downloadUrl,
            status: "pending",
            createdAt: serverTimestamp() as any,
          };

          await setDoc(doc(db, "transfers", transferId), transferData);
        }
      }

      setSelectedFiles([]);
      setSelectedUsers([]);
      setSearchTerm("");
      setSearchResults([]);
      alert("Files sent successfully!");
    } catch (e: any) {
      alert("Failed to send files:\n" + e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 w-full">
        <div>
          <h2 className="text-[36px] sm:text-[44px] font-extrabold tracking-tight text-slate-900 mb-1 leading-tight">
            Send a File
          </h2>
          <p className="text-slate-500 font-medium text-[16px]">
            Select recipients and securely attach files to transfer.
          </p>
        </div>

        {/* Minimal Illustration (Top Right) */}
        <div className="hidden md:flex items-center justify-end w-[320px] h-[100px] opacity-90 relative top-2">
          <svg
            width="280"
            height="90"
            viewBox="0 0 280 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50 70 L210 70"
              stroke="#6C4EFF"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.3"
            />

            {/* Laptop Left */}
            <rect
              x="20"
              y="40"
              width="44"
              height="28"
              rx="2"
              fill="#F8F9FC"
              stroke="#334155"
              strokeWidth="2"
            />
            <path
              d="M14 68 L70 68"
              stroke="#334155"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M30 45 L54 45"
              stroke="#6C4EFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.4"
            />

            {/* Laptop Right */}
            <rect
              x="220"
              y="40"
              width="44"
              height="28"
              rx="2"
              fill="#F8F9FC"
              stroke="#334155"
              strokeWidth="2"
            />
            <path
              d="M214 68 L270 68"
              stroke="#334155"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Paper Plane */}
            <path d="M120 20 L160 10 L140 45 L132 32 Z" fill="#6C4EFF" />
            <path d="M120 20 L132 32 L128 40 Z" fill="#5A3EE0" />

            {/* Lock Info */}
            <circle
              cx="140"
              cy="70"
              r="14"
              fill="white"
              stroke="#E2E8F0"
              strokeWidth="2"
            />
            <path
              d="M137 68 v-2 a3 3 0 0 1 6 0 v2 h1 a1 1 0 0 1 1 1 v4 a1 1 0 0 1 -1 1 h-8 a1 1 0 0 1 -1 -1 v-4 a1 1 0 0 1 1 -1 z"
              fill="#6C4EFF"
            />

            {/* Sparkles */}
            <path
              d="M180 20 L182 12 L190 10 L182 8 L180 0 L178 8 L170 10 L178 12 Z"
              fill="#6C4EFF"
              opacity="0.2"
            />
            <circle cx="210" cy="15" r="2" fill="#6C4EFF" opacity="0.4" />
            <circle cx="80" cy="20" r="1.5" fill="#6C4EFF" opacity="0.4" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-8 w-full block">
        {/* Left Column: Form Areas */}
        <div className="flex-1 w-full space-y-6">
          {/* Step 1: Select Users Card */}
          <div className="bg-white rounded-[24px] shadow-sm shadow-[#6C4EFF]/5 border border-slate-100 p-6 sm:p-7 transition-all hover:shadow-[0_4px_24px_rgba(108,78,255,0.06)]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-[14px] bg-[#6C4EFF]/10 flex items-center justify-center text-[#6C4EFF]">
                <UserPlus className="w-[22px] h-[22px] stroke-[2]" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-slate-900 leading-tight">
                  Recipient
                </h3>
                <p className="text-[14px] text-slate-500 font-medium mt-0.5">
                  Choose who will receive your files
                </p>
              </div>
            </div>

            <div className="relative z-30">
              <div className="flex items-center px-4 bg-white border border-slate-200 rounded-[16px] shadow-sm focus-within:ring-4 focus-within:ring-[#6C4EFF]/10 focus-within:border-[#6C4EFF]/50 transition-all h-[56px] group">
                <Search className="w-5 h-5 text-slate-400 mr-3 group-focus-within:text-[#6C4EFF] transition-colors" />
                <input
                  id="recipient-search-input"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by username or paste ID"
                  className="flex-1 bg-transparent border-none outline-none text-[15px] text-slate-800 placeholder:text-slate-400 h-full w-full"
                />
                {isSearching ? (
                  <div className="ml-3 text-slate-400">
                    <div className="w-4 h-4 border-2 border-[#6C4EFF]/30 border-t-[#6C4EFF] rounded-full animate-spin" />
                  </div>
                ) : (
                  <svg
                    className="w-5 h-5 text-slate-400 ml-3 opacity-60"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                    <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                    <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                    <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                  </svg>
                )}
              </div>

              {/* Results Dropdown */}
              {searchResults.length > 0 && searchTerm.trim().length > 0 && (
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-100 rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] max-h-[320px] overflow-y-auto z-50 py-2">
                  {searchResults.map((u) => {
                    const isSelected = selectedUsers.some(
                      (su) => su.uid === u.uid,
                    );
                    return (
                      <button
                        key={u.uid}
                        onClick={() => toggleUserSelection(u)}
                        className="w-full text-left flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50 group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              u.photoURL ||
                              "https://ui-avatars.com/api/?name=" +
                                u.name +
                                "&background=random"
                            }
                            alt={u.name}
                            className="w-10 h-10 rounded-full border border-slate-100 shadow-sm object-cover bg-white"
                          />
                          <div>
                            <div
                              className={`text-[15px] font-bold leading-tight mb-0.5 ${isSelected ? "text-[#6C4EFF]" : "text-slate-800"}`}
                            >
                              {u.name}
                            </div>
                            <div className="text-[13px] font-medium text-slate-500">
                              @{u.username} &middot; ID: {u.searchId}
                            </div>
                          </div>
                        </div>
                        <div className="pl-4">
                          {isSelected ? (
                            <div className="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-[#6C4EFF] shadow-sm">
                              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-[22px] h-[22px] rounded-full border-2 border-slate-200 transition-colors group-hover:border-slate-300" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* No Results state */}
              {searchTerm.trim().length > 0 &&
                searchResults.length === 0 &&
                !isSearching && (
                  <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-100 rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-50 p-6 text-center text-[14px] text-slate-500 font-medium">
                    No users found matching "{searchTerm}"
                  </div>
                )}
            </div>

            {/* Selected Users Chips */}
            {selectedUsers.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-3">
                {selectedUsers.map((user) => (
                  <div
                    key={user.uid}
                    className="flex items-center h-[52px] pl-2 pr-2 bg-white border border-slate-200 rounded-[14px] shadow-sm hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={
                            user.photoURL ||
                            "https://ui-avatars.com/api/?name=" +
                              user.name +
                              "&background=random"
                          }
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover shadow-sm bg-slate-100"
                        />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="pr-3 border-r border-slate-100 py-1">
                        <div className="text-[14px] font-bold text-slate-800 leading-tight mb-[2px]">
                          {user.name}
                        </div>
                        <div className="text-[11px] font-medium text-slate-500 leading-tight">
                          @pc_ID: {user.searchId}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeUser(user.uid)}
                      className="ml-2 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4 stroke-[2]" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const input = document.querySelector(
                      'input[type="text"]',
                    ) as HTMLInputElement;
                    if (input) input.focus();
                  }}
                  className="flex items-center h-[52px] px-5 bg-white border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-600 rounded-[14px] text-[14px] font-medium transition-all group"
                >
                  <span className="mr-2 text-[18px] leading-none opacity-60 group-hover:opacity-100">
                    +
                  </span>{" "}
                  Add another
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Select Files Card */}
          <div className="bg-white rounded-[24px] shadow-sm shadow-[#6C4EFF]/5 border border-slate-100 p-6 sm:p-7 relative transition-all hover:shadow-[0_4px_24px_rgba(108,78,255,0.06)]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-[14px] bg-[#6C4EFF]/10 flex items-center justify-center text-[#6C4EFF]">
                <FileIcon className="w-[22px] h-[22px] stroke-[2]" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-slate-900 leading-tight">
                  Files
                </h3>
                <p className="text-[14px] text-slate-500 font-medium mt-0.5">
                  Drag files here or browse from your device
                </p>
              </div>
            </div>

            <div className="flex flex-col w-full">
              <label
                className={`flex flex-col items-center justify-center w-full h-[200px] border-[1.5px] border-dashed border-[#6C4EFF]/30 rounded-[20px] bg-[#6C4EFF]/[0.02] cursor-pointer transition-all hover:bg-[#6C4EFF]/[0.05] hover:border-[#6C4EFF]/50 group`}
              >
                <div className="flex flex-col items-center justify-center text-center px-4">
                  <div className="w-14 h-14 rounded-full border border-white bg-white shadow-[0_2px_8px_rgba(108,78,255,0.12)] flex items-center justify-center mb-4 text-[#6C4EFF] group-hover:scale-110 transition-transform duration-300">
                    <UploadCloud className="w-6 h-6 stroke-[2]" />
                  </div>
                  <p className="text-[16px] font-bold text-slate-800 mb-1.5 leading-tight">
                    Drop files here
                  </p>
                  <p className="mb-4 text-[14px] text-slate-500 font-medium">
                    or{" "}
                    <span className="font-semibold text-[#6C4EFF] group-hover:underline">
                      browse
                    </span>{" "}
                    from your device
                  </p>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    Maximum file size: 10 GB
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const newFiles = Array.from(e.target.files);
                      setSelectedFiles((prev) => [...prev, ...newFiles]);
                    }
                  }}
                />
              </label>

              {selectedFiles.length > 0 && (
                <div className="mt-5 space-y-2 max-h-64 overflow-y-auto pr-2">
                  {selectedFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-[16px] hover:border-slate-200 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-[#6C4EFF]/10 rounded-[10px] shrink-0 text-[#6C4EFF]">
                          {f.name.endsWith(".zip") ? (
                            <svg
                              className="w-5 h-5 stroke-[2]"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"></path>
                              <path d="M14 2v6h6"></path>
                              <path d="M2 10h10"></path>
                              <path d="M2 14h10"></path>
                              <path d="M2 18h10"></path>
                              <path d="M7 10v8"></path>
                              <path d="M4 10v8"></path>
                            </svg>
                          ) : f.type.startsWith("image/") ? (
                            <svg
                              className="w-5 h-5 stroke-[2]"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect
                                x="3"
                                y="3"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                              ></rect>
                              <circle cx="8.5" cy="8.5" r="1.5"></circle>
                              <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                          ) : f.type.startsWith("video/") ? (
                            <svg
                              className="w-5 h-5 stroke-[2]"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polygon points="23 7 16 12 23 17 23 7"></polygon>
                              <rect
                                x="1"
                                y="5"
                                width="15"
                                height="14"
                                rx="2"
                                ry="2"
                              ></rect>
                            </svg>
                          ) : (
                            <FileIcon className="w-5 h-5 stroke-[2]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[14px] font-bold text-slate-800 truncate max-w-[180px] sm:max-w-xs">
                            {f.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="text-[13px] font-medium text-slate-500">
                          {(f.size / 1024 / 1024).toFixed(2)}{" "}
                          {f.size > 1024 * 1024 * 1024 ? "GB" : "MB"}
                        </div>
                        <button
                          onClick={() => removeFile(i)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <X className="w-[18px] h-[18px] stroke-[2]" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Totals under files */}
                  <div className="pt-2 pb-1 flex items-center justify-between px-2 text-[13px] font-medium text-slate-500 mt-2">
                    <div className="flex items-center">
                      <span>
                        Total {selectedFiles.length}{" "}
                        {selectedFiles.length === 1 ? "file" : "files"}
                      </span>
                      <span className="mx-2 opacity-50">•</span>
                      <span className="font-bold text-[#6C4EFF]">
                        {(
                          selectedFiles.reduce((acc, f) => acc + f.size, 0) /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Transfer Summary Sidebar */}
        <div className="w-full lg:w-[340px] shrink-0 space-y-6">
          <div className="bg-white rounded-[24px] shadow-sm shadow-[#6C4EFF]/5 border border-slate-100 p-6 sm:p-7 sticky top-[104px]">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-[14px] bg-[#6C4EFF]/10 flex items-center justify-center text-[#6C4EFF]">
                <FileIcon className="w-[22px] h-[22px] stroke-[2]" />
              </div>
              <h3 className="text-[17px] font-bold text-slate-900 leading-tight">
                Transfer Summary
              </h3>
            </div>

            <div className="border border-slate-100 rounded-[20px] overflow-hidden bg-white">
              {/* Recipients */}
              <div className="flex items-center px-5 py-4 border-b border-slate-50">
                <div className="w-10 h-10 rounded-full bg-[#6C4EFF]/5 flex items-center justify-center text-[#6C4EFF] mr-4 shrink-0">
                  <UserPlus className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] text-slate-500 font-medium mb-0.5 leading-none">
                    Recipients
                  </span>
                  <span className="text-[15px] font-bold text-slate-800 leading-none">
                    {selectedUsers.length} selected
                  </span>
                </div>
              </div>

              {/* Files */}
              <div className="flex items-center px-5 py-4 border-b border-slate-50">
                <div className="w-10 h-10 rounded-full bg-[#6C4EFF]/5 flex items-center justify-center text-[#6C4EFF] mr-4 shrink-0">
                  <FileIcon className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] text-slate-500 font-medium mb-0.5 leading-none">
                    Files
                  </span>
                  <span className="text-[15px] font-bold text-slate-800 leading-none">
                    {selectedFiles.length}{" "}
                    {selectedFiles.length === 1 ? "file" : "files"}
                  </span>
                </div>
              </div>

              {/* Total Size */}
              <div className="flex items-center px-5 py-4 border-b border-slate-50">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mr-4 shrink-0">
                  <svg
                    className="w-4 h-4 stroke-[2]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] text-slate-500 font-medium mb-0.5 leading-none">
                    Total Size
                  </span>
                  <span className="text-[15px] font-bold text-slate-800 leading-none">
                    {(
                      selectedFiles.reduce((acc, f) => acc + f.size, 0) /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </span>
                </div>
              </div>

              {/* Encryption */}
              <div className="flex items-center px-5 py-4 border-b border-slate-50">
                <div className="w-10 h-10 rounded-full bg-[#6C4EFF]/10 flex items-center justify-center text-[#6C4EFF] mr-4 shrink-0">
                  <svg
                    className="w-4 h-4 stroke-[2]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <path d="M12 8v4"></path>
                    <path d="M12 16h.01"></path>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] text-slate-500 font-medium mb-0.5 leading-none">
                    Encryption
                  </span>
                  <span className="text-[15px] font-bold text-slate-800 leading-none">
                    AES-256{" "}
                    <span className="opacity-70 font-medium">(Standard)</span>
                  </span>
                </div>
              </div>

              {/* Estimated Time */}
              <div className="flex items-center px-5 py-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mr-4 shrink-0">
                  <Clock className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] text-slate-500 font-medium mb-0.5 leading-none">
                    Estimated Time
                  </span>
                  <span className="text-[15px] font-bold text-slate-800 leading-none">
                    ~ {selectedFiles.length > 0 ? "1 min" : "0 min"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-[#6C4EFF]/5 rounded-[16px] p-4 flex gap-3.5 text-[#6C4EFF]">
              <div className="shrink-0 pt-0.5">
                <svg
                  className="w-5 h-5 stroke-[2]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                  ></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div className="leading-snug pr-2">
                <p className="text-[13px] font-bold text-[#6C4EFF]">
                  Your files are end-to-end encrypted
                </p>
                <p className="text-[12px] font-medium text-[#6C4EFF]/80 mt-1">
                  and never stored on our servers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleSendFiles}
        disabled={
          selectedUsers.length === 0 || selectedFiles.length === 0 || uploading
        }
        className="w-full relative h-[72px] flex items-center bg-gradient-to-r from-[#6C4EFF] to-[#5A3EE0] text-white rounded-[24px] shadow-[0_8px_32px_rgba(108,78,255,0.25)] hover:shadow-[0_12px_40px_rgba(108,78,255,0.35)] hover:-translate-y-[2px] disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none disabled:cursor-not-allowed active:translate-y-[1px] transition-all overflow-hidden group"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {uploading ? (
          <div className="flex items-center justify-center w-full gap-3 font-bold text-[18px]">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
            Uploading securely...
          </div>
        ) : (
          <>
            <div className="absolute inset-x-0 flex items-center justify-center gap-3 font-bold text-[18px]">
              <SendIcon className="w-6 h-6 stroke-[2]" />
              Send Files Securely
            </div>
            <div className="absolute right-8 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <svg
                className="w-5 h-5 opacity-90 stroke-[2] transition-transform group-hover:translate-x-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </div>
          </>
        )}
      </button>

      {/* Active Outgoing */}
      {activeTransfers.length > 0 && (
        <div className="mt-12 mb-8">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 pl-2">
            <Clock className="w-4 h-4" /> Active Outgoing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTransfers.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-[16px] p-4 border border-slate-100 shadow-sm flex items-center justify-between"
              >
                <div className="min-w-0 pr-4">
                  <div className="font-bold text-slate-800 truncate text-[14px]">
                    {t.fileName}
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5 max-w-[200px] truncate">
                    Recipient ID: {t.receiverId}
                  </div>
                </div>
                <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 bg-amber-500/10 text-amber-600 rounded-lg uppercase tracking-wider">
                  {t.status === "pending" ? "Waiting" : t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
