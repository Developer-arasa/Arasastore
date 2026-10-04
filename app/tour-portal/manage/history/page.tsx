"use client";

import { useState, useEffect } from "react";
import { Playfair_Display } from "next/font/google";
import { supabase } from "@/lib/supabase";
import { History as HistoryIcon, Calendar, Users, ShoppingBag, Clock, Bus } from "lucide-react";
import Link from "next/link";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function HistoryPage() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                className="bg-white border border-[#E5D3B3]/60 p-5 sm:p-6 rounded-2xl hover:shadow-md transition-all flex flex-col h-full relative overflow-hidden"
              >
                {/* Pita status (Visual cue) */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${session.status === 'active' ? 'bg-[#00AA5B]' : 'bg-[#2B1B17]/20'}`}></div>

                <div className="pl-3">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${
                      session.status === 'active' 
                      ? 'bg-[#00AA5B]/10 text-[#00AA5B]' 
                      : 'bg-[#2B1B17]/5 text-[#2B1B17]/50'
                    }`}>
                      {session.status === 'active' ? 'Sedang Berjalan' : 'Selesai'}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-[#2B1B17]/50 font-medium">
                      <Calendar size={12} /> {dateString}
                    </div>
                  </div>
                  
                  <h3 className={`${playfair.className} text-xl font-bold text-[#2B1B17] mb-1 truncate`}>
                    {session.group_name || "Rombongan Tanpa Nama"}
                  </h3>
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-[#2B1B17]/40 mb-5">
                    <span>ID: {session.id.substring(0, 8)}</span>
                    <span className="w-1 h-1 bg-[#E5D3B3] rounded-full"></span>
                    <span className="flex items-center gap-1"><Clock size={10}/> {session.eta}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-[#FDFBF7] p-2.5 rounded-xl border border-[#E5D3B3]/40 text-center">
                      <Users size={14} className="mx-auto text-[#2B1B17]/40 mb-1" />
                      <p className="text-sm font-bold text-[#2B1B17]">{totalPassengers}</p>
                    </div>
                    <div className="bg-[#FDFBF7] p-2.5 rounded-xl border border-[#E5D3B3]/40 text-center">
                      <ShoppingBag size={14} className="mx-auto text-[#2B1B17]/40 mb-1" />
                      <p className="text-sm font-bold text-[#2B1B17]">{totalItems}</p>
                    </div>
                    <div className="bg-[#FDFBF7] p-2.5 rounded-xl border border-[#E5D3B3]/40 text-center">
                      <Bus size={14} className="mx-auto text-[#2B1B17]/40 mb-1" />
                      <p className="text-xs font-bold text-[#4A0E17] mt-1">
                        {totalRevenue > 0 ? (totalRevenue / 1000).toFixed(0) + 'K' : '0'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-t border-[#E5D3B3]/30 flex justify-between items-center">
                    <span className="text-[10px] text-[#2B1B17]/50 font-light">
                      Total Omzet:
                    </span>
                    <span className="text-sm font-bold text-[#4A0E17]">
                      Rp {totalRevenue.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}