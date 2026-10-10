"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, User, Home, ClipboardList, History } from "lucide-react";
import { Playfair_Display } from "next/font/google";
import Link from "next/link";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function NavbarTL() {
  const [tlName, setTlName] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const name = localStorage.getItem("tour_name");
    if (name) setTlName(name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("tour_token");
    localStorage.removeItem("tour_name");
    localStorage.removeItem("tour_agency");
    router.push("/tour-portal");
  };

  const isDashboard = pathname === "/tour-portal/manage";
  // Logic diubah: nyala kalau pathname ada di dalam /detail atau sub-foldernya
  const isDetail = pathname.startsWith("/tour-portal/manage/detail");
  const isHistory = pathname === "/tour-portal/manage/history";

  return (
    <>
      <nav className="sticky top-0 z-50 hidden border-b border-[#eadbc9] bg-[#f7f1e8]/90 backdrop-blur-xl sm:block">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex h-[4.5rem] items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 pr-6 border-r border-[#E5D3B3]/40">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#4A0E17] text-xs font-bold tracking-widest text-white">A</span>
                <span className={`${playfair.className} text-2xl font-bold text-[#4A0E17]`}>
                  Arasa <span className="text-[#a96d4d]">Tour</span>
                </span>
              </div>
              
              <div className="flex items-center gap-6">
                <Link href="/tour-portal/manage" className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${isDashboard ? 'bg-[#4A0E17] text-white' : 'text-[#2B1B17]/50 hover:bg-white hover:text-[#4A0E17]'}`}>
                  Dashboard
                </Link>
                <Link href="/tour-portal/manage/detail" className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${isDetail ? 'bg-[#4A0E17] text-white' : 'text-[#2B1B17]/50 hover:bg-white hover:text-[#4A0E17]'}`}>
                  Detail Order
                </Link>
                <Link href="/tour-portal/manage/history" className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${isHistory ? 'bg-[#4A0E17] text-white' : 'text-[#2B1B17]/50 hover:bg-white hover:text-[#4A0E17]'}`}>
                  Riwayat
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 rounded-full border border-[#eadbc9] bg-white/70 px-3 py-2 text-[#2B1B17]/80">
                <User size={16} className="text-[#4A0E17]" />
                <span className="text-sm font-medium">{tlName || "Tour Leader"}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[#4A0E17] transition-colors hover:bg-[#4A0E17]/10"
              >
                <LogOut size={16} />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#eadbc9] bg-white/95 shadow-[0_-12px_35px_-20px_rgba(74,14,23,.35)] backdrop-blur-xl sm:hidden">
        <div className="flex h-[4.25rem] items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          <Link 
            href="/tour-portal/manage" 
            className={`flex h-full w-full flex-col items-center justify-center space-y-1 transition-colors ${isDashboard ? 'text-[#4A0E17]' : 'text-[#2B1B17]/40'}`}
          >
            <Home size={20} strokeWidth={isDashboard ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-wider">Beranda</span>
          </Link>
          
          <Link 
            href="/tour-portal/manage/detail"
            className={`flex h-full w-full flex-col items-center justify-center space-y-1 transition-colors ${isDetail ? 'text-[#4A0E17]' : 'text-[#2B1B17]/40'}`}
          >
            <ClipboardList size={20} strokeWidth={isDetail ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-wider">Detail</span>
          </Link>
          
          <Link 
            href="/tour-portal/manage/history" 
            className={`flex h-full w-full flex-col items-center justify-center space-y-1 transition-colors ${isHistory ? 'text-[#4A0E17]' : 'text-[#2B1B17]/40'}`}
          >
            <History size={20} strokeWidth={isHistory ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-wider">Riwayat</span>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="flex h-full w-full flex-col items-center justify-center space-y-1 text-[#2B1B17]/40 transition-colors hover:text-[#4A0E17]"
          >
            <LogOut size={20} strokeWidth={2} />
            <span className="text-[9px] font-bold uppercase tracking-wider">Keluar</span>
          </button>
        </div>
      </nav>
    </>
  );
}