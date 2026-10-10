"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { ArrowLeft, Check, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/store/useCartStore";

const playfair = Playfair_Display({ subsets: ["latin"] });

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string | null;
  image_url: string;
};

export default function TourProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.session_id as string;
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCartStore();

  useEffect(() => {
    const savedSession = localStorage.getItem("arasa_tour_session");
    const savedName = localStorage.getItem("arasa_passenger_name");
    const isDone = localStorage.getItem(`arasa_order_done_${sessionId}`);

    if (isDone) {
      router.replace(`/tour-portal/${sessionId}/success`);
      return;
    }

    if (savedSession !== sessionId || !savedName) {
      router.replace(`/tour-portal/${sessionId}`);
      return;
    }

    setIsAuthorized(true);

    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();

        if (error) throw error;
        setProduct(data as Product);
      } catch (error) {
        console.error("Gagal menarik detail produk:", error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId, router, sessionId]);

  const addProductToCart = () => {
    if (!product) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: quantity,
      image: product.image_url,
      category: product.category,
    });
  };

  const handleAddToCart = () => {
    addProductToCart();
    setIsAdded(true);
    window.setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addProductToCart();
    router.push(`/tour-portal/${sessionId}/checkout`);
  };

  if (!isAuthorized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFBF7]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5D3B3] border-t-[#4A0E17]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#FDFBF7] px-4 text-center">
        <h2 className={`${playfair.className} mb-4 text-2xl font-bold text-[#4A0E17]`}>
          Produk tidak ditemukan
        </h2>
        <Link
          href={`/tour-portal/${sessionId}/catalog`}
          className="text-sm text-[#2B1B17] underline underline-offset-4"
        >
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <main className="min-h-screen bg-[#FDFBF7] py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href={`/tour-portal/${sessionId}/catalog`}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-[#2B1B17]/60 transition-colors hover:text-[#4A0E17] sm:mb-10"
        >
          <ArrowLeft size={16} /> Kembali ke Katalog
        </Link>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 lg:gap-20">
          <div className="rounded-2xl border border-[#E5D3B3]/40 bg-white p-4 shadow-sm sm:p-6">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-[#E5D3B3]/20">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${product.image_url}')` }}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="mb-3 text-xs font-bold uppercase tracking-widest text-[#E5D3B3]">
              {product.category}
            </span>
            <h1 className={`${playfair.className} mb-4 text-3xl font-bold text-[#2B1B17] sm:text-4xl lg:text-5xl`}>
              {product.name}
            </h1>

            <div className="mb-8 rounded-xl border border-[#E5D3B3]/30 bg-[#F5F0E6]/50 p-6">
              <p className="mb-2 text-3xl font-bold text-[#4A0E17]">{formattedPrice}</p>
              <p className="text-sm font-light leading-6 text-[#2B1B17]/70">
                {product.description || "Produk pilihan Arasa Store untuk perjalanan Anda."}
              </p>
            </div>

            <div className="mb-10 flex items-center gap-6 border-b border-[#E5D3B3]/40 pb-10">
              <span className="text-sm font-bold uppercase tracking-widest text-[#2B1B17]">
                Kuantitas
              </span>
              <div className="flex items-center rounded-full border border-[#E5D3B3] bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="flex h-10 w-10 items-center justify-center text-[#2B1B17] transition-colors hover:text-[#4A0E17] disabled:opacity-30"
                  aria-label="Kurangi kuantitas"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-bold text-[#2B1B17]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-10 w-10 items-center justify-center text-[#2B1B17] transition-colors hover:text-[#4A0E17]"
                  aria-label="Tambah kuantitas"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full border px-6 py-4 text-sm font-medium uppercase tracking-widest transition-all ${
                  isAdded
                    ? "border-[#00AA5B] bg-[#00AA5B] text-white"
                    : "border-[#4A0E17] bg-transparent text-[#4A0E17] hover:bg-[#4A0E17]/5"
                }`}
              >
                {isAdded ? <><Check size={18} /> Dimasukkan</> : <><ShoppingBag size={18} /> Masukkan Keranjang</>}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#4A0E17] px-6 py-4 text-sm font-medium uppercase tracking-widest text-[#FDFBF7] shadow-lg transition-all hover:bg-[#2B1B17]"
              >
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}