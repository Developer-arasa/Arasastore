"use client";
import { useState, useEffect } from "react";
import { X, Trash2, Plus, Minus, MessageCircle } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"] });

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQty } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);

  // Mencegah Hydration Mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Hitung Total Harga
  const grandTotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
  const formattedTotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(grandTotal);

  // Fungsi Generate Teks WA untuk Banyak Barang
  const handleCheckoutWA = () => {
    if (cart.length === 0) return;

    let waText = "Halo Admin Arasa, saya mau checkout pesanan berikut:\n\n";
    
    cart.forEach((item, index) => {
      const subtotal = item.price * item.qty;
      const formattedSub = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(subtotal);
      waText += `${index + 1}. ${item.name}\n   └ ${item.qty}x — ${formattedSub}\n`;
    });

    waText += `\n*TOTAL KESELURUHAN: ${formattedTotal}*\n\nMohon informasi ketersediaan dan cara pembayarannya. Terima kasih!`;
    
    const waLink = `https://wa.me/628155138385?text=${encodeURIComponent(waText)}`;
    window.open(waLink, '_blank');
  };

  return (
    <>
      {/* Overlay Hitam Transparan */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#2B1B17]/60 z-50 transition-opacity backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Panel Laci (Drawer) */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#FDFBF7] z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header Drawer */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5D3B3]/40">
          <h2 className={`${playfair.className} text-2xl font-bold text-[#4A0E17]`}>Keranjang</h2>
          <button onClick={onClose} className="text-[#2B1B17]/60 hover:text-[#4A0E17] transition-colors p-2">
            <X size={24} />
          </button>
        </div>

        {/* Isi Keranjang (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
              <MessageCircle size={48} className="text-[#2B1B17] mb-4" />
              <p className="text-[#2B1B17] font-medium">Keranjang masih kosong.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white p-3 rounded-xl border border-[#E5D3B3]/40 shadow-sm">
                <div className="w-20 h-20 relative rounded-lg overflow-hidden shrink-0 bg-[#E5D3B3]/20">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-[#2B1B17] text-sm leading-tight pr-2">{item.name}</h3>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-[#4A0E17] font-semibold text-sm mb-3">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price)}
                  </p>
                  
                  {/* Plus Minus Qty */}
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="flex items-center bg-[#FDFBF7] border border-[#E5D3B3] rounded-full px-2 py-1">
                      <button onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))} className="text-[#2B1B17] hover:text-[#4A0E17] p-1 disabled:opacity-30" disabled={item.qty <= 1}>
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-bold w-6 text-center text-[#2B1B17]">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} className="text-[#2B1B17] hover:text-[#4A0E17] p-1">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-[#E5D3B3]/40 bg-white">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-bold uppercase tracking-widest text-[#2B1B17]/60">Total</span>
              <span className={`${playfair.className} text-2xl font-bold text-[#4A0E17]`}>{formattedTotal}</span>
            </div>
            <button 
              onClick={handleCheckoutWA}
              className="w-full flex items-center justify-center gap-2 bg-[#4A0E17] text-[#FDFBF7] hover:bg-[#2B1B17] px-6 py-4 rounded-full text-sm font-medium uppercase tracking-widest transition-all shadow-lg"
            >
              <MessageCircle size={18} /> Checkout via WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
}