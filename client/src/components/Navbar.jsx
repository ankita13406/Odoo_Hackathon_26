
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut, Menu, Package, Settings, User } from "lucide-react";
 
// Hardcoded until auth wiring lands — swap for the real session user later.
const CURRENT_USER = {
  name: "admin",
  role: "Asset Manager",
  email: "admin@company.com",
  initials: "A",
};
 
const NOTIFICATION_COUNT = 3;
 
export default function Navbar({ onMenuClick }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
 
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
 
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: mobile menu toggle + brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
 
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700">
              <Package className="h-5 w-5 text-white" />
            </span>
            <div className="leading-tight">
              <p className="text-base font-semibold text-slate-900">AssetFlow</p>
              <p className="hidden text-xs text-slate-400 sm:block">Enterprise Asset Management</p>
            </div>
          </div>
        </div>
 
        {/* Right: notifications + profile */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {NOTIFICATION_COUNT > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white ring-2 ring-white">
                {NOTIFICATION_COUNT}
              </span>
            )}
          </button>
 
          <div className="mx-1 h-8 w-px bg-slate-200" />
 
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen((open) => !open)}
              className="flex items-center gap-2.5 rounded-lg py-1.5 pl-1.5 pr-2.5 hover:bg-slate-100"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
                {CURRENT_USER.initials}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-medium text-slate-800">
                  {CURRENT_USER.name}
                </span>
                <span className="block text-xs text-slate-400">{CURRENT_USER.role}</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>
 
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-medium text-slate-800">{CURRENT_USER.name}</p>
                  <p className="truncate text-xs text-slate-400">{CURRENT_USER.email}</p>
                </div>
 
                <nav className="py-1">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    My Profile
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    Settings
                  </button>
                </nav>
 
                <div className="border-t border-slate-100 py-1">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
 









