import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Home, Send, Download, Activity, Users, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../AppContext";
import GlobalTransferToast from "./GlobalTransferToast";

export default function Layout() {
  const location = useLocation();
  const { profile } = useAppContext();

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/send", icon: Send, label: "Send" },
    { to: "/receive", icon: Download, label: "Receive" },
    { to: "/activity", icon: Activity, label: "Activity" },
    { to: "/contacts", icon: Users, label: "Contacts" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col md:flex-row font-sans text-slate-900 selection:bg-[#6C4EFF]/20 relative overflow-hidden">
      {/* Subtle Purple Glow */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#6C4EFF]/[0.08] via-transparent to-transparent blur-[80px] pointer-events-none -z-0"></div>

      {/* Desktop Sidebar (Linear/Notion style) */}
      <aside className="hidden md:flex flex-col w-[240px] bg-[#F8F9FC] border-r border-[#6C4EFF]/5 h-screen sticky top-0 py-6 px-4 shrink-0 transition-all z-10">
        <div className="mb-6 px-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-[10px] bg-[#6C4EFF] shadow-[0_4px_12px_rgba(108,78,255,0.3)] flex items-center justify-center">
            <Send className="w-4 h-4 text-white -ml-0.5" />
          </div>
          <span className="font-bold text-[18px] tracking-tight text-slate-900">
            Bhej
          </span>
        </div>

        <nav className="flex-1 space-y-1 mt-2">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-all group relative ${
                  isActive
                    ? "text-[#6C4EFF] bg-[#6C4EFF]/10"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#6C4EFF] rounded-r-md"></div>
                )}
                <item.icon
                  className={`w-[18px] h-[18px] ${isActive ? "text-[#6C4EFF]" : "text-slate-400 group-hover:text-slate-600"}`}
                />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Settings -> Links to Profile for now */}
        <div className="mt-auto mb-4">
          <NavLink
            to="/profile"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-all group relative ${
              location.pathname === "/profile"
                ? "text-[#6C4EFF] bg-[#6C4EFF]/10"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            {location.pathname === "/profile" && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#6C4EFF] rounded-r-md"></div>
            )}
            <Settings
              className={`w-[18px] h-[18px] ${location.pathname === "/profile" ? "text-[#6C4EFF]" : "text-slate-400 group-hover:text-slate-600"}`}
            />
            Settings
          </NavLink>
        </div>

        {profile && (
          <div className="pt-4 border-t border-slate-200/60">
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl transition-colors">
              <div className="relative">
                <img
                  src={
                    profile.photoURL ||
                    "https://ui-avatars.com/api/?name=" +
                      profile.name +
                      "&background=random"
                  }
                  alt={profile.name}
                  className="w-9 h-9 rounded-full object-cover shadow-sm bg-slate-100"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#F8F9FC] rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-slate-800 truncate leading-none">
                  {profile.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-1 leading-none hover:text-slate-700 transition-colors">
                  @{profile.username}
                </div>
              </div>
              <button className="p-1 px-1.5 hover:bg-slate-200/60 rounded-md text-slate-400">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative h-screen overflow-y-auto overflow-x-hidden z-10">
        <header className="md:hidden flex items-center justify-center h-14 bg-[#F8F9FC]/80 backdrop-blur-2xl border-b border-slate-200/50 sticky top-0 z-20 shrink-0">
          <span className="font-semibold text-lg tracking-tight">
            {[...navItems, { to: "/profile", label: "Settings" }].find(
              (i) =>
                i.to ===
                (location.pathname === "/"
                  ? "/"
                  : `/${location.pathname.split("/")[1]}`),
            )?.label || "Bhej"}
          </span>
        </header>

        <div className="flex-1 w-full relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99, transition: { duration: 0.15 } }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <GlobalTransferToast />

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-3xl border-t border-slate-200/50 flex justify-around items-end pb-6 pt-2 z-30 px-2 shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.05)]">
        {navItems.slice(0, 4).map((item) => {
          const isActive =
            location.pathname === item.to ||
            (item.to !== "/" && location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors ${
                isActive
                  ? "text-[#6C4EFF]"
                  : "text-slate-400 hover:text-slate-900"
              }`}
            >
              <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
