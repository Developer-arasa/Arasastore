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
    router.push("/tour-portal");
  };

  const isDashboard = pathname === "/tour-portal/manage";
  // Logic diubah: nyala kalau pathname ada di dalam /detail atau sub-foldernya
  const isDetail = pathname.startsWith("/tour-portal/manage/detail");
  const isHistory = pathname === "/tour-portal/manage/history";

  return (
    <>
      <nav className="hidden sm:block sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#E5D3B3]/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 pr-6 border-r border-[#E5D3B3]/40">
                <span className="bg-[#4A0E17] text-[#FDFBF7] text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-widest">
                  B2B
                </span>
                <span className={`${playfair.className} text-2xl font-bold text-[#4A0E17]`}>
                  Arasa Tour
                </span>
              </div>
              
              <div className="flex items-center gap-6">
                <Link href="/tour-portal/manage" className={`text-sm font-bold uppercase tracking-widest transition-colors ${isDashboard ? 'text-[#4A0E17]' : 'text-[#2B1B17]/40 hover:text-[#4A0E17]'}`}>
                  Dashboard
                </Link>
                <Link href="/tour-portal/manage/detail" className={`text-sm font-bold uppercase tracking-widest transition-colors ${isDetail ? 'text-[#4A0E17]' : 'text-[#2B1B17]/40 hover:text-[#4A0E17]'}`}>
                  Detail Order
                </Link>
                <Link href="/tour-portal/manage/history" className={`text-sm font-bold uppercase tracking-widest transition-colors ${isHistory ? 'text-[#4A0E17]' : 'text-[#2B1B17]/40 hover:text-[#4A0E17]'}`}>
                  Riwayat
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[#2B1B17]/80 bg-[#E5D3B3]/20 px-4 py-2 rounded-full border border-[#E5D3B3]/50">
                <User size={16} className="text-[#4A0E17]" />
                <span className="text-sm font-medium">{tlName || "Tour Leader"}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#4A0E17] hover:bg-[#4A0E17]/10 px-4 py-2.5 rounded-full transition-colors"
              >
                <LogOut size={16} />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E5D3B3]/40 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          <Link 
            href="/tour-portal/manage" 
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isDashboard ? 'text-[#4A0E17]' : 'text-[#2B1B17]/40'}`}
          >
            <Home size={20} strokeWidth={isDashboard ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-wider">Beranda</span>
          </Link>
          
          <Link 
            href="/tour-portal/manage/detail"
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isDetail ? 'text-[#4A0E17]' : 'text-[#2B1B17]/40'}`}
          >
            <ClipboardList size={20} strokeWidth={isDetail ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-wider">Detail</span>
          </Link>
          
          <Link 
            href="/tour-portal/manage/history" 
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isHistory ? 'text-[#4A0E17]' : 'text-[#2B1B17]/40'}`}
          >
            <History size={20} strokeWidth={isHistory ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-wider">Riwayat</span>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="flex flex-col items-center justify-center w-full h-full space-y-1 text-[#2B1B17]/40 hover:text-[#4A0E17] transition-colors"
          >
            <LogOut size={20} strokeWidth={2} />
            <span className="text-[9px] font-bold uppercase tracking-wider">Keluar</span>
          </button>
        </div>
      </nav>
    </>
  );
}