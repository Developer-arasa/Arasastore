"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { ArrowLeft, MapPin, User, Bus, Info, Trash2, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/store/useCartStore";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function CheckoutPassengerPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.session_id as string;

  // refactored logic: narik fungsi update dan remove dari store
  const { cart, clearCart, updateQty, removeFromCart } = useCartStore();
  
  const [passenger, setPassenger] = useState({ name: "", bus: "", seat: "" });
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setIsMounted(true);
    const name = localStorage.getItem("arasa_passenger_name") || "";
    const bus = localStorage.getItem("arasa_bus_number") || "";
    const seat = localStorage.getItem("arasa_seat_number") || "";

    if (!name) {
      router.push(`/tour-portal/${sessionId}`);
      return;
    }
    
    setPassenger({ name, bus, seat });

    if (!isSuccess && cart.length === 0) {
      router.push(`/tour-portal/${sessionId}/catalog`);
    }
  }, [sessionId, router, cart.length, isSuccess]);

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

  // refactored logic: sesuaikan tipe id dengan store
  const handleQtyChange = (id: string | number, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty < 1) {
      if (removeFromCart) removeFromCart(id);
    } else {
      if (updateQty) updateQty(id, newQty);
    }
  };

  const handleProcessOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { data: orderData, error: orderError } = await supabase
        .from("tour_orders")
        .insert([{
          session_id: sessionId,
          passenger_name: passenger.name,
          seat_number: passenger.seat,
          status: "pending"
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        tour_order_id: orderData.id,
        product_id: item.id,
        qty: item.qty,
        price_at_checkout: item.price
      }));

      const { error: itemsError } = await supabase
        .from("tour_order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setIsSuccess(true);
      localStorage.setItem(`arasa_order_done_${sessionId}`, "true");
      clearCart();
      router.push(`/tour-portal/${sessionId}/success`);

    } catch (error) {
      console.error("Gagal memproses pesanan:", error);
      setErrorMessage("Pesanan belum berhasil dikirim. Pastikan koneksi stabil lalu coba lagi.");
      setIsSubmitting(false);
    }
  };

  if (!isMounted || (cart.length === 0 && !isSuccess)) return null;

  return (
    <div className="min-h-screen relative bg-[#f7f1e8] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#E5D3B3]/40 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/tour-portal/${sessionId}/catalog`} className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#2B1B17]/60 hover:text-[#4A0E17] font-medium transition-colors">
            <ArrowLeft size={16} /> Kembali
          </Link>
          <span className={`${playfair.className} text-lg font-bold text-[#4A0E17]`}>Konfirmasi Pesanan</span>
          <div className="w-16"></div>
        </div>
      </div>
      {errorMessage && <p role="alert" className="mx-auto mt-5 max-w-3xl rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Identitas Card */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5D3B3]/40 shadow-sm">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#2B1B17]/50 mb-3 border-b border-[#E5D3B3]/30 pb-2">Data Pemesan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E5D3B3]/20 flex items-center justify-center text-[#4A0E17]"><User size={14} /></div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-[#2B1B17]/50">Nama</p>
                <p className="text-sm font-bold text-[#2B1B17]">{passenger.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E5D3B3]/20 flex items-center justify-center text-[#4A0E17]"><Bus size={14} /></div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-[#2B1B17]/50">No. Bus</p>
                <p className="text-sm font-bold text-[#2B1B17]">{passenger.bus}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E5D3B3]/20 flex items-center justify-center text-[#4A0E17]"><MapPin size={14} /></div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-[#2B1B17]/50">No. Kursi</p>
                <p className="text-sm font-bold text-[#2B1B17]">{passenger.seat}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ringkasan Pesanan (Interactive) */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5D3B3]/40 shadow-sm">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#2B1B17]/50 mb-4 border-b border-[#E5D3B3]/30 pb-2">Ringkasan Belanja</h2>
          <div className="space-y-5">
            {cart.map((item, index) => (
              <div key={index} className="flex gap-3 relative group">
                <div className="w-16 h-16 rounded-xl bg-[#E5D3B3]/20 bg-cover bg-center shrink-0 border border-[#E5D3B3]/30" style={{ backgroundImage: `url('${item.image}')` }} />
                
                <div className="flex-1 flex flex-col justify-center pr-8">
                  <h3 className="text-sm font-bold text-[#2B1B17] line-clamp-1">{item.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center bg-white border border-[#E5D3B3] rounded-full overflow-hidden shadow-sm">
                      <button onClick={() => handleQtyChange(item.id, item.qty, -1)} className="w-7 h-7 flex items-center justify-center text-[#2B1B17] hover:bg-[#4A0E17]/5 transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-[#2B1B17]">{item.qty}</span>
                      <button onClick={() => handleQtyChange(item.id, item.qty, 1)} className="w-7 h-7 flex items-center justify-center text-[#2B1B17] hover:bg-[#4A0E17]/5 transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-[#4A0E17]">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price * item.qty)}</p>
                  </div>
                </div>

                <button 
                  onClick={() => removeFromCart && removeFromCart(item.id)}
                  className="absolute top-0 right-0 p-1.5 text-[#2B1B17]/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Hapus Item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Info Pembayaran */}
        <div className="bg-[#4A0E17]/5 p-4 rounded-xl border border-[#4A0E17]/10 flex items-start gap-3">
          <Info size={16} className="text-[#4A0E17] shrink-0 mt-0.5" />
          <p className="text-xs text-[#2B1B17]/70 font-light leading-relaxed">
            Pembayaran dilakukan <strong className="font-bold text-[#4A0E17]">secara kolektif melalui Tour Leader</strong> Anda atau saat pesanan diserahkan. Pesanan yang sudah dikirim tidak dapat diubah dari sistem.
          </p>
        </div>
      </div>

      {/* Footer Total & Submit */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5D3B3]/40 p-4 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#2B1B17]/50 font-bold mb-0.5">Total Tagihan ({totalQty} Item)</p>
            <p className="text-lg font-bold text-[#4A0E17]">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalAmount)}</p>
          </div>
          <button 
            onClick={handleProcessOrder}
            disabled={isSubmitting}
            className="bg-[#4A0E17] text-[#FDFBF7] px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#2B1B17] transition-all disabled:opacity-50 shadow-md flex-shrink-0 min-w-[140px] flex justify-center"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              "Kirim Pesanan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}