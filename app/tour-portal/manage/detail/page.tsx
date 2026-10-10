"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { supabase } from "@/lib/supabase";
import { Bus, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function DetailHubPage() {
  const router = useRouter();
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveSessions();
  }, []);

  const fetchActiveSessions = async () => {
    try {
      const token = localStorage.getItem("tour_token");
      
      if (!token) {
        router.replace("/tour-portal");
        return;
      }

      let query = supabase
        .from("tour_sessions")
        .select("id, group_name, eta, created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      query = query.eq("tl_id", token);

      const { data, error } = await query;
      if (error) throw error;
      
      setActiveSessions(data || []);
    } catch (err) {
      console.error("Gagal menarik data sesi aktif:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-[#E5D3B3] border-t-[#4A0E17] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (activeSessions.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 text-center">
        <Bus size={64} className="mx-auto text-[#E5D3B3] mb-6" />
        <h2 className={`${playfair.className} text-3xl font-bold text-[#2B1B17] mb-2`}>
          Tidak Ada Sesi Aktif
        </h2>
        <p className="text-[#2B1B17]/60 font-light mb-8">
          Anda belum memiliki rombongan yang sedang berjalan saat ini.
        </p>
        <Link 
          href="/tour-portal/manage"
          className="inline-flex items-center justify-center bg-[#4A0E17] text-[#FDFBF7] px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#2B1B17] transition-all shadow-lg"
        >
          Ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto pb-10">
      <div className="mb-8 text-center sm:text-left">
        <h1 className={`${playfair.className} text-3xl sm:text-4xl font-bold text-[#2B1B17] mb-2`}>
          Pilih Rombongan
        </h1>
        <p className="text-sm text-[#2B1B17]/60 font-light">
          Pilih sesi aktif di bawah ini untuk melihat detail pesanan dan menyalin Magic Link.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {activeSessions.map((session) => (
          <Link 
            key={session.id} 
            href={`/tour-portal/manage/detail/${session.id}`}
            className="bg-white border border-[#E5D3B3]/60 p-5 rounded-2xl hover:shadow-md hover:border-[#4A0E17]/30 transition-all flex items-center justify-between group"
          >
            <div>
              <h3 className={`${playfair.className} text-xl font-bold text-[#2B1B17] mb-1`}>
                {session.group_name || "Rombongan Tanpa Nama"}
              </h3>
              <div className="flex items-center gap-3 text-xs text-[#2B1B17]/50 font-medium">
                <span className="uppercase tracking-widest text-[#4A0E17]">ID: {session.id.substring(0, 8)}</span>
                <span className="flex items-center gap-1"><Clock size={12}/> ETA: {session.eta}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FDFBF7] border border-[#E5D3B3] flex items-center justify-center text-[#2B1B17]/40 group-hover:text-[#4A0E17] group-hover:bg-[#E5D3B3]/20 transition-all">
              <ChevronRight size={20} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}