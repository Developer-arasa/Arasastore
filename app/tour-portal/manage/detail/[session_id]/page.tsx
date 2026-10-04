"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, Copy, RefreshCw, CheckCircle2, 
  Users, ShoppingBag, Send, User, ChevronRight 
} from "lucide-react";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.session_id as string;

  const [session, setSession] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (sessionId) fetchSessionData();
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from("tour_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData);

      const { data: ordersData, error: ordersError } = await supabase
        .from("tour_orders")
        .select(`
          *,
          tour_order_items (
            qty,
            price_at_checkout
          )
        `)
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

    } catch (err) {
      console.error("Gagal menarik detail sesi:", err);
      alert("Gagal memuat data rombongan.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const metrics = useMemo(() => {
    let passengers = orders.length;
    let items = 0;
    let revenue = 0;

    orders.forEach(order => {
      order.tour_order_items?.forEach((item: any) => {
        items += item.qty;
        revenue += (item.qty * item.price_at_checkout);
      });
    });

    return { totalPassengers: passengers, totalItems: items, totalRevenue: revenue };
  }, [orders]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSessionData();
  };

  const copyMagicLink = () => {
    const magicLink = `${window.location.origin}/tour-portal/${sessionId}`;
    navigator.clipboard.writeText(magicLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const finalizeOrder = () => {
    const text = `Halo Admin Arasa,%0A%0ASaya ingin konfirmasi pesanan rombongan B2B:%0A*Nama Rombongan:* ${session?.group_name || 'Rombongan'}%0A*ID Sesi:* ${sessionId.substring(0,8)}%0A*Estimasi Tiba (ETA):* ${session?.eta}%0A%0A*Total Penumpang:* ${metrics.totalPassengers} orang%0A*Total Produk:* ${metrics.totalItems} item%0A*Estimasi Tagihan:* Rp ${metrics.totalRevenue.toLocaleString('id-ID')}%0A%0AMohon disiapkan. Terima kasih!`;
    const waUrl = `https://wa.me/6281234567890?text=${text}`; 
    window.open(waUrl, '_blank');
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
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.push('/tour-portal/manage/detail')}
          className="p-2.5 bg-white border border-[#E5D3B3] rounded-full text-[#2B1B17] hover:bg-[#FDFBF7] transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className={`${playfair.className} text-2xl sm:text-3xl font-bold text-[#2B1B17]`}>
            {session?.group_name || "Detail Rombongan"}
          </h1>
          <div className="flex items-center gap-3 text-xs text-[#2B1B17]/60 font-medium mt-1">
            <span className="uppercase tracking-widest text-[#4A0E17]">ID: {sessionId.substring(0, 8)}</span>
            <span className="w-1 h-1 bg-[#E5D3B3] rounded-full"></span>
            <span>ETA: {session?.eta}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E5D3B3]/60 rounded-3xl p-5 sm:p-6 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#2B1B17] mb-1">
            Magic Link Penumpang
          </h2>
          <p className="text-xs text-[#2B1B17]/60 font-light">
            Bagikan link ini ke grup WhatsApp agar rombongan bisa memesan mandiri.
          </p>
        </div>
        <button 
          onClick={copyMagicLink}
          className={`flex-shrink-0 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all shadow-md ${
            isCopied 
            ? 'bg-[#00AA5B] text-white border-transparent' 
            : 'bg-[#4A0E17] text-[#FDFBF7] hover:bg-[#2B1B17]'
          }`}
        >
          {isCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
          {isCopied ? "Link Tersalin!" : "Salin Link"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
        <div className="bg-white border border-[#E5D3B3]/60 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
          <Users size={20} className="text-[#E5D3B3] mb-2" />
          <p className="text-2xl font-bold text-[#2B1B17]">{metrics.totalPassengers}</p>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#2B1B17]/50 mt-1">Penumpang</span>
        </div>
        <div className="bg-white border border-[#E5D3B3]/60 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
          <ShoppingBag size={20} className="text-[#E5D3B3] mb-2" />
          <p className="text-2xl font-bold text-[#2B1B17]">{metrics.totalItems}</p>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#2B1B17]/50 mt-1">Total Item</span>
        </div>
        <div className="bg-gradient-to-br from-[#4A0E17] to-[#691224] p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-md">
          <p className="text-lg sm:text-xl font-bold text-[#FDFBF7] mt-2 mb-1">
            {new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(metrics.totalRevenue)}
          </p>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#FDFBF7]/70">Est. Tagihan</span>
        </div>
      </div>

      <div className="bg-white border border-[#E5D3B3]/60 rounded-3xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#E5D3B3]/40 bg-[#FDFBF7]/30">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#2B1B17]">
            Daftar Pesanan Masuk
          </h2>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#4A0E17] hover:bg-[#4A0E17]/10 px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Memuat...' : 'Refresh'}
          </button>
        </div>

        <div className="divide-y divide-[#E5D3B3]/30">
          {orders.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center">
              <ShoppingBag size={32} className="text-[#E5D3B3] mb-3" />
              <p className="text-sm text-[#2B1B17]/60 font-light">Belum ada pesanan dari penumpang.</p>
            </div>
          ) : (
            orders.map((order) => {
              let totalQty = 0;
              let totalPrice = 0;
              order.tour_order_items?.forEach((item: any) => {
                totalQty += item.qty;
                totalPrice += (item.qty * item.price_at_checkout);
              });

              return (
                <div key={order.id} className="p-4 sm:p-5 hover:bg-[#FDFBF7] transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#E5D3B3]/20 flex items-center justify-center flex-shrink-0 text-[#4A0E17]">
                      <User size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#2B1B17]">{order.passenger_name}</h3>
                      <p className="text-[10px] uppercase tracking-widest text-[#2B1B17]/50 mt-0.5">
                        Kursi: <span className="font-bold text-[#2B1B17]/80">{order.seat_number || '-'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#4A0E17]">Rp {totalPrice.toLocaleString('id-ID')}</p>
                      <p className="text-[10px] text-[#2B1B17]/50">{totalQty} item</p>
                    </div>
                    <button className="hidden sm:block p-2 text-[#E5D3B3] group-hover:text-[#4A0E17] transition-colors">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          onClick={finalizeOrder}
          className="flex items-center gap-2 bg-[#00AA5B] text-white px-6 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#008c4b] transition-all shadow-lg hover:-translate-y-1"
        >
          <Send size={18} />
          Kirim ke WA Admin
        </button>
      </div>
    </div>
  );
}