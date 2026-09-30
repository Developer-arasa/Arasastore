"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { ArrowLeft, MessageCircle, ShoppingBag, Plus, Minus, Star, Check } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
// Koneksi Supabase
import { supabase } from "@/lib/supabase";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function ProductDetailPage() {
  const params = useParams();
  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  
  // State untuk Supabase
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { addToCart } = useCartStore();

  // Tarik data spesifik berdasarkan ID (UUID) dari Supabase
  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!params.id) return;
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', params.id)
          .single(); // Ambil 1 baris data aja

        if (data && !error) {
          setProduct(data);
        }
      } catch (error) {
        console.error("Gagal menarik detail produk:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetail();
  }, [params.id]);

  // UI Skeleton Loading
  if (isLoading) {
    return (
      <div className="bg-[#FDFBF7] min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-40 h-5 bg-[#E5D3B3]/40 animate-pulse rounded mb-10"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5D3B3]/40 shadow-sm animate-pulse">
              <div className="aspect-square w-full rounded-xl bg-[#E5D3B3]/30"></div>
            </div>
            <div className="flex flex-col animate-pulse">
              <div className="w-24 h-4 bg-[#E5D3B3]/40 rounded mb-3"></div>
              <div className="w-3/4 h-12 bg-[#E5D3B3]/40 rounded mb-6"></div>
              <div className="w-1/2 h-5 bg-[#E5D3B3]/40 rounded mb-8"></div>
              <div className="bg-[#F5F0E6]/50 p-6 rounded-xl border border-[#E5D3B3]/30 mb-8">
                <div className="w-1/3 h-8 bg-[#E5D3B3]/40 rounded mb-2"></div>
                <div className="w-2/3 h-4 bg-[#E5D3B3]/40 rounded"></div>
              </div>
              <div className="w-full h-14 bg-[#E5D3B3]/40 rounded-full mt-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Kalau ID nggak ada di Database
  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FDFBF7]">
        <h2 className="text-2xl font-bold text-[#4A0E17] mb-4">Produk tidak ditemukan</h2>
        <Link href="/the-collection" className="text-[#2B1B17] underline underline-offset-4">Kembali ke Koleksi</Link>
      </div>
    );
  }

  // Kalkulasi & Formatting
  const priceNumber = product.price; // Dari Supabase udah integer
  const subtotal = priceNumber * qty;
  const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(priceNumber);
  const formattedSubtotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(subtotal);

  const waNumber = "628155138385";
  const waText = encodeURIComponent(`Halo Admin Arasa, saya mau pesan:\n\nProduk: ${product.name}\nJumlah: ${qty}\nTotal: ${formattedSubtotal}\n\nMohon info ketersediaan dan cara pembayarannya.`);
  const waLink = `https://wa.me/${waNumber}?text=${waText}`;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: priceNumber,
      qty: qty,
      image: product.image_url, // Pakai image_url dari database
      category: product.category,
    });
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000); 
  };

  return (
    <div className="bg-[#FDFBF7] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link href="/the-collection" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-[#2B1B17]/60 hover:text-[#4A0E17] transition-colors mb-10 font-medium">
          <ArrowLeft size={16} /> Kembali ke Koleksi
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E5D3B3]/40 shadow-sm">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#E5D3B3]/20">
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url('${product.image_url}')` }} 
              />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-widest text-[#E5D3B3] font-bold mb-3">{product.category}</span>
            <h1 className={`${playfair.className} text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2B1B17] mb-4`}>{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex text-[#E5D3B3]">
                {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
              </div>
              <span className="text-sm text-[#2B1B17]/60 font-light">4.9 / 5.0 Penilaian</span>
            </div>

            <div className="bg-[#F5F0E6]/50 p-6 rounded-xl border border-[#E5D3B3]/30 mb-8">
              <p className="text-3xl font-bold text-[#4A0E17] mb-2">{formattedPrice}</p>
              <p className="text-sm text-[#2B1B17]/70 font-light">{product.description}</p>
            </div>

            <div className="flex items-center gap-6 mb-10 border-b border-[#E5D3B3]/40 pb-10">
              <span className="text-sm font-bold uppercase tracking-widest text-[#2B1B17]">Kuantitas</span>
              <div className="flex items-center bg-white border border-[#E5D3B3] rounded-full">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-[#2B1B17] hover:text-[#4A0E17] transition-colors disabled:opacity-30" disabled={qty <= 1}>
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-bold text-[#2B1B17]">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center text-[#2B1B17] hover:text-[#4A0E17] transition-colors">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <button 
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 border px-6 py-4 rounded-full text-sm font-medium uppercase tracking-widest transition-all ${
                  isAdded 
                  ? "bg-[#00AA5B] border-[#00AA5B] text-white" 
                  : "bg-transparent border-[#4A0E17] text-[#4A0E17] hover:bg-[#4A0E17]/5"
                }`}
              >
                {isAdded ? <><Check size={18} /> Dimasukkan</> : <><ShoppingBag size={18} /> Masukkan Keranjang</>}
              </button>

              <a 
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-[#4A0E17] text-[#FDFBF7] hover:bg-[#2B1B17] px-6 py-4 rounded-full text-sm font-medium uppercase tracking-widest transition-all shadow-lg"
              >
                <MessageCircle size={18} /> Beli Sekarang
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}