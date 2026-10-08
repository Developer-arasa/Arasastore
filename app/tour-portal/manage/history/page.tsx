"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { supabase } from "@/lib/supabase";
import { History as HistoryIcon, Calendar, Users, ShoppingBag, ChevronRight } from "lucide-react";
import Link from "next/link";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    try {
      const token = localStorage.getItem("tour_token");
      
      // refactored logic: narik 50 sesi terakhir sebagai mitigasi limit data
      let query = supabase
        .from("tour_sessions")
        .select(`
          id,
          group_name,
          eta,
          status,
          created_at,
          tour_orders (
            id,
            tour_order_items (
              qty,
              price_at_checkout
            )
          )
        `)
        .neq("status", "active") 
        .order("created_at", { ascending: false })
        .limit(50);

      if (token) {
        query = query.eq("tl_id", token);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSessions(data || []);

    } catch (err) {
      console.error("Gagal menarik data riwayat:", err);
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

  return (
    <div className="w-full max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className={`${playfair.className} text-3xl sm:text-4xl font-bold text-[#2B1B17] mb-2 flex items-center gap-3`}>
            Riwayat Rombongan
          </h1>
          <p className="text-sm sm:text-base text-[#2B1B17]/70 font-light">
            Rekapitulasi 50 sesi terakhir yang pernah Anda kelola.
          </p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-[#E5D3B3] rounded-3xl">
          <HistoryIcon size={48} className="mx-auto text-[#E5D3B3] mb-4" />
          <p className="text-[#2B1B17]/60 font-light">Belum ada riwayat rombongan.</p>
          <Link 
            href="/tour-portal/manage"
            className="inline-block mt-6 px-6 py-2 bg-[#FDFBF7] border border-[#E5D3B3] text-[#2B1B17] rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#E5D3B3]/20 transition-all"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#E5D3B3]/60 rounded-3xl overflow-hidden shadow-sm">
          <div className="divide-y divide-[#E5D3B3]/40">
            {sessions.map((session) => {
              let totalPassengers = session.tour_orders?.length || 0;
              let totalItems = 0;
              let totalRevenue = 0;

              session.tour_orders?.forEach((order: any) => {
                order.tour_order_items?.forEach((item: any) => {
                  totalItems += item.qty;
                  totalRevenue += (item.qty * item.price_at_checkout);
                });
              });

              const dateObj = new Date(session.created_at);
              const dateString = dateObj.toLocaleDateString('id-ID', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              });

              return (
                <div 
                  key={session.id} 
                  // refactored logic: navigasi ke detail saat list diklik
                  onClick={() => router.push(`/tour-portal/manage/detail/${session.id}`)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[#FDFBF7] active:bg-[#E5D3B3]/10 transition-colors group"
                >
                  {/* Info Kiri */}
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${session.status === 'active' ? 'bg-[#00AA5B] animate-pulse' : 'bg-[#2B1B17]/30'}`}></span>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#2B1B17]/50">
                        {session.status === 'active' ? 'Sedang Berjalan' : 'Selesai'}
                      </p>
                    </div>
                    
                    <h3 className={`${playfair.className} text-base sm:text-lg font-bold text-[#2B1B17] line-clamp-1`}>
                      {session.group_name || "Rombongan Tanpa Nama"}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-xs text-[#2B1B17]/60">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-[#E5D3B3]" /> 
                        {dateString}
                      </span>
                      <span className="w-1 h-1 bg-[#E5D3B3] rounded-full hidden sm:block"></span>
                      <span className="flex items-center gap-1">
                        <Users size={12} className="text-[#E5D3B3]" />
                        {totalPassengers} Org
                      </span>
                      <span className="w-1 h-1 bg-[#E5D3B3] rounded-full hidden sm:block"></span>
                      <span className="flex items-center gap-1">
                        <ShoppingBag size={12} className="text-[#E5D3B3]" />
                        {totalItems} Item
                      </span>
                    </div>
                  </div>

                  {/* Omzet & Action Kanan */}
                  <div className="text-right flex flex-col items-end justify-center gap-1 shrink-0">
                    <p className="text-sm sm:text-base font-bold text-[#4A0E17]">
                      Rp {totalRevenue.toLocaleString('id-ID')}
                    </p>
                    <div className="text-[#E5D3B3] group-hover:text-[#4A0E17] transition-colors mt-1">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}