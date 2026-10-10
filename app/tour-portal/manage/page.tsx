"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { supabase } from "@/lib/supabase";
import { PlusCircle, Clock, Users, ArrowRight, X, Wallet, Activity } from "lucide-react";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function DashboardTLPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ activeSessions: 0, totalPassengers: 0, potentialRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [tlName, setTlName] = useState("");
  
  // refactored logic: penambahan state groupName untuk modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [eta, setEta] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const router = useRouter();

  useEffect(() => {
    const name = localStorage.getItem("tour_name");
    const token = localStorage.getItem("tour_token");
    
    if (!token || !name) {
      router.replace("/tour-portal");
      return;
    }

    setTlName(name);
    fetchDashboardData(token);
  }, [router]);

  const fetchDashboardData = async (tlId: string) => {
    try {
      let query = supabase
        .from("tour_sessions")
        .select(`
          *,
          tour_orders (
            id,
            tour_order_items (
              qty,
              price_at_checkout
            )
          )
        `)
        .order("created_at", { ascending: false });

      query = query.eq("tl_id", tlId);

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        setSessions(data);
        
        let activeCount = 0;
        let passengerCount = 0;
        let revenueCount = 0;

        data.forEach(session => {
          if (session.status === 'active') {
            activeCount++;
            if (session.tour_orders) {
              passengerCount += session.tour_orders.length;
              session.tour_orders.forEach((order: any) => {
                if (order.tour_order_items) {
                  order.tour_order_items.forEach((item: any) => {
                    revenueCount += (item.qty * item.price_at_checkout);
                  });
                }
              });
            }
          }
        });

        setMetrics({
          activeSessions: activeCount,
          totalPassengers: passengerCount,
          potentialRevenue: revenueCount
        });
      }
    } catch (err) {
      console.error("Gagal menarik data dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName) return alert("Nama rombongan wajib diisi!");
    
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const token = localStorage.getItem("tour_token");
      const tlName = localStorage.getItem("tour_name");
      const travelAgent = localStorage.getItem("tour_agency");

      if (!token || !tlName || !travelAgent) {
        router.replace("/tour-portal");
        return;
      }
      
      // refactored logic: insert tanpa ETA (di-hardcode strip)
      const { data, error } = await supabase
        .from("tour_sessions")
        .insert([{
          group_name: groupName.trim(),
          tl_name: tlName,
          travel_agent: travelAgent,
          eta: null,
          status: "active",
          tl_id: token
        }])
        .select()
        .single();

      if (error) throw error;
      
      setGroupName("");
      setIsModalOpen(false); // Tutup modal
      fetchDashboardData(token); // Refresh data beranda
      
    } catch (err) {
      console.error("Gagal buat sesi:", err);
      setErrorMessage("Sesi baru belum berhasil dibuat. Periksa koneksi lalu coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className={`${playfair.className} text-3xl sm:text-4xl font-bold text-[#2B1B17] mb-2`}>
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-[#2B1B17]/70 font-light">
            Selamat datang, <span className="font-medium">{tlName}</span>.
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#4A0E17] text-[#FDFBF7] px-6 py-3.5 sm:py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#2B1B17] transition-all shadow-lg"
        >
          <PlusCircle size={18} />
          Buat Sesi Baru
        </button>
      </div>
      {errorMessage && <p role="alert" className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}

      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 mb-10">
          <div className="bg-gradient-to-br from-[#4A0E17] to-[#691224] p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-md text-[#FDFBF7] flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4 opacity-80">
              <Activity size={16} />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Sesi Aktif</span>
            </div>
            <p className="text-3xl sm:text-4xl font-bold">{metrics.activeSessions}</p>
          </div>
          
          <div className="bg-white border border-[#E5D3B3]/60 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4 text-[#2B1B17]/50">
              <Users size={16} />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Penumpang</span>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-[#2B1B17]">{metrics.totalPassengers}</p>
          </div>

          <div className="col-span-2 md:col-span-1 bg-white border border-[#E5D3B3]/60 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4 text-[#2B1B17]/50">
              <Wallet size={16} />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Estimasi Pembayaran Total</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-[#4A0E17]">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(metrics.potentialRevenue)}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#2B1B17] mb-2 border-b border-[#E5D3B3]/40 pb-2">
          Daftar Rombongan
        </h2>
        
        {loading ? (
          <div className="w-full h-32 bg-[#E5D3B3]/30 animate-pulse rounded-2xl"></div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-[#E5D3B3] rounded-3xl">
            <Users size={40} className="mx-auto text-[#E5D3B3] mb-4" />
            <p className="text-[#2B1B17]/60 font-light text-sm">Belum ada sesi rombongan yang dibuat.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {sessions.map((session) => {
              const orderCount = session.tour_orders?.length || 0;
              return (
                <div 
                  key={session.id} 
                  className="bg-white border border-[#E5D3B3]/60 p-5 sm:p-6 rounded-2xl hover:shadow-xl hover:border-[#4A0E17]/30 transition-all group cursor-pointer flex flex-col h-full"
                  onClick={() => router.push(`/tour-portal/manage/detail/${session.id}`)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${session.status === 'active' ? 'bg-[#00AA5B]/10 text-[#00AA5B]' : 'bg-[#2B1B17]/10 text-[#2B1B17]/60'}`}>
                      {session.status}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-[#2B1B17]/50 font-medium">
                      <Clock size={14} /> {session.eta || "ETA Belum Diatur"}
                    </div>
                  </div>
                  
                  {/* refactored logic: tampilkan group_name sebagai judul utama */}
                  <h3 className={`${playfair.className} text-xl font-bold text-[#2B1B17] mb-1 truncate`}>
                    {session.group_name || "Rombongan Tanpa Nama"}
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#2B1B17]/40 mb-3">
                    ID: {session.id.substring(0, 8)}
                  </p>

                  <div className="text-xs text-[#2B1B17]/60 font-light mb-5 flex-grow space-y-1">
                    <p>{new Date(session.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="font-medium text-[#4A0E17]">{orderCount} Penumpang Order</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[#4A0E17] mt-auto pt-4 border-t border-[#E5D3B3]/20">
                    <span className="group-hover:text-[#691224] transition-colors flex items-center">
                      Kelola Pesanan <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#2B1B17]/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-[#E5D3B3]/40">
              <h2 className={`${playfair.className} text-2xl font-bold text-[#2B1B17]`}>Sesi Baru</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-[#2B1B17]/50 hover:text-[#4A0E17] transition-colors p-2"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateSession} className="p-6">
              <div className="mb-5">
                <label className="block text-xs font-bold uppercase tracking-widest text-[#2B1B17] mb-2">
                  Nama Rombongan
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Contoh:  Arasa Tour ke Bali"
                  required
                  className="w-full px-5 py-3.5 rounded-xl border border-[#E5D3B3]/80 outline-none focus:border-[#4A0E17] focus:ring-1 focus:ring-[#4A0E17] transition-all bg-[#FDFBF7]/50 text-sm"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest text-[#2B1B17] border border-[#E5D3B3] hover:bg-[#FDFBF7] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#4A0E17] text-[#FDFBF7] py-3.5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#2B1B17] transition-all disabled:opacity-50 flex justify-center items-center shadow-md"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    "Buat Sesi"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}