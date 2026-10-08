"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/store/useCartStore";
import { CheckCircle, Edit2, FileText, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function PassengerSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.session_id as string;

  const { addToCart, clearCart } = useCartStore();
  
  const [sessionStatus, setSessionStatus] = useState<string>("active");
  const [order, setOrder] = useState<any>(null);
  const [passengerName, setPassengerName] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const checkStatusAndFetchOrder = async () => {
      const name = localStorage.getItem("arasa_passenger_name");
      const isDone = localStorage.getItem(`arasa_order_done_${sessionId}`);

      if (!name || !isDone) {
        router.push(`/tour-portal/${sessionId}`);
        return;
      }
      setPassengerName(name);

      try {
        // 1. Cek status sesi (active / locked)
        const { data: sessionData } = await supabase
          .from("tour_sessions")
          .select("status")
          .eq("id", sessionId)
          .single();
        
        if (sessionData) setSessionStatus(sessionData.status);

        // 2. Tarik data pesanan penumpang ini
        const { data: orderData, error: orderError } = await supabase
          .from("tour_orders")
          .select(`
            *,
            tour_order_items (
              product_id,
              qty,
              price_at_checkout,
              products (
                name,
                image_url,
                category
              )
            )
          `)
          .eq("session_id", sessionId)
          .eq("passenger_name", name)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (orderError) throw orderError;
        setOrder(orderData);

      } catch (error) {
        console.error("Gagal menarik data pesanan:", error);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) checkStatusAndFetchOrder();
  }, [sessionId, router]);

  // refactored logic: hapus order lama, injeksi ulang ke cart, redirect ke catalog
  const handleEditOrder = async () => {
    if (!confirm("Jika lanjut, pesanan ini akan dibatalkan sementara dan Anda harus checkout ulang. Yakin ingin mengedit?")) return;
    
    setIsEditing(true);
    try {
      // 1. Injeksi item ke Zustand Cart
      clearCart();
      order.tour_order_items.forEach((item: any) => {
        addToCart({
          id: item.product_id,
          name: item.products.name,
          price: item.price_at_checkout,
          qty: item.qty,
          image: item.products.image_url,
          category: item.products.category || "Produk",
        });
      });

      // 2. Hapus flag di local storage
      localStorage.removeItem(`arasa_order_done_${sessionId}`);

      // 3. Hapus order dari database (cascade akan menghapus items)
      await supabase.from("tour_orders").delete().eq("id", order.id);

      // 4. Lempar balik ke katalog
      router.push(`/tour-portal/${sessionId}/catalog`);
    } catch (error) {
      console.error("Gagal edit pesanan:", error);
      alert("Gagal menyiapkan mode edit. Pastikan koneksi stabil.");
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-[#E5D3B3] border-t-[#4A0E17] rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalAmount = order?.tour_order_items?.reduce((sum: number, item: any) => sum + (item.qty * item.price_at_checkout), 0) || 0;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 md:p-8 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-lg border border-[#E5D3B3]/40 overflow-hidden"
      >
        {/* Banner Area */}
        <div className="bg-[#F5F0E6] p-8 text-center border-b border-[#E5D3B3]/40">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-[#E5D3B3]/60">
            <CheckCircle size={40} className="text-[#00AA5B]" />
          </div>
          <p className="text-[#2B1B17]/60 text-sm font-light mb-2">Terima kasih atas pesanan</p>
          <h1 className={`${playfair.className} text-2xl font-bold text-[#4A0E17] mb-4 capitalize`}>
            {passengerName}
          </h1>
          <p className="text-sm text-[#2B1B17]/70 font-light leading-relaxed">
            dan akan kami proses. Kami tunggu kedatangannya di <strong className="font-bold text-[#4A0E17]">Arasa Store</strong>.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Action Buttons */}
          <div className={`grid gap-3 ${sessionStatus === 'active' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {sessionStatus === 'active' ? (
              <button
                onClick={handleEditOrder}
                disabled={isEditing}
                className="flex items-center justify-center gap-2 py-3.5 rounded-full border border-[#E5D3B3] text-[#2B1B17] text-xs font-bold uppercase tracking-widest hover:bg-[#FDFBF7] transition-all disabled:opacity-50"
              >
                {isEditing ? <span className="w-4 h-4 border-2 border-[#2B1B17]/30 border-t-[#2B1B17] rounded-full animate-spin"></span> : <><Edit2 size={16} /> Edit Pesanan</>}
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#E5D3B3]/20 text-[#4A0E17] text-xs font-bold uppercase tracking-widest">
                <Lock size={16} /> Pesanan Terkunci
              </div>
            )}
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-center gap-2 bg-[#4A0E17] text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#2B1B17] shadow-md transition-all"
            >
              <FileText size={16} /> Lihat Pesanan {showDetails ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            </button>
          </div>

          {/* Expandable Details */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 border border-[#E5D3B3]/40 rounded-2xl bg-[#FDFBF7]/50 p-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#2B1B17]/50 border-b border-[#E5D3B3]/40 pb-2 mb-3">Rincian Belanja</h3>
                  <div className="space-y-3 mb-4">
                    {order?.tour_order_items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[#2B1B17] line-clamp-1">{item.products?.name}</p>
                          <p className="text-[10px] text-[#2B1B17]/60 mt-0.5">{item.qty} x {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price_at_checkout)}</p>
                        </div>
                        <p className="text-xs font-bold text-[#4A0E17] shrink-0">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.qty * item.price_at_checkout)}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-[#E5D3B3]/40 pt-3 flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#2B1B17]/50">Total Bayar</span>
                    <span className="text-lg font-bold text-[#4A0E17]">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalAmount)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {sessionStatus === 'locked' && (
            <p className="text-[10px] text-center text-[#2B1B17]/50 pt-2 px-4 leading-relaxed">
              Pesanan ini sudah diteruskan oleh Tour Leader ke sistem kasir dan tidak dapat diubah.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}