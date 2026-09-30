"use client";

import { useState, useEffect } from "react";
import { Playfair_Display } from "next/font/google";
import { ArrowRight, SlidersHorizontal, Search, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
// Koneksi Supabase
import { supabase } from "@/lib/supabase";

const playfair = Playfair_Display({ subsets: ["latin"] });

const categories = ["All", "Onde-Onde", "Pastry & Cookies", "Cakes & Lapis", "Savory Snack"];

export default function TheCollectionPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // State untuk Supabase
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Narik Semua Data Produk
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: true });

        if (data && !error) {
          setAllProducts(data);
        }
      } catch (error) {
        console.error("Gagal menarik data katalog:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Kombinasi Filter Kategori + Search (partial match, case-insensitive)
  const filteredProducts = allProducts.filter((product) => {
    // Filter kategori dulu
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    
    // Kemudian filter search (case-insensitive, anywhere in name - middle or end too)
    const matchesSearch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Clear search jika empty
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="bg-[#FDFBF7] min-h-screen">
      {/* HERO SECTION - Responsive & Adaptive */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #4A0E17 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <span className="inline-block text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#4A0E17] font-bold mb-4 md:mb-6 px-4 py-1.5 bg-[#4A0E17]/5 rounded-full">
            Kurasi Eksklusif Kami
          </span>
          <h1 className={`${playfair.className} text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#2B1B17] mb-4 md:mb-6 leading-tight`}>
            The Collection
          </h1>
          <p className="text-sm md:text-base text-[#2B1B17]/70 max-w-xl md:max-w-2xl mx-auto font-light leading-relaxed px-2">
            Setiap produk dikurasi secara ketat untuk menghadirkan kualitas premium dan cita rasa autentik.
          </p>
        </motion.div>
      </section>

      {/* STICKY TOOLBAR - Filter + Search + Count (Responsive) */}
      <div className="sticky top-20 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-y border-[#E5D3B3]/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          
          {/* SEARCH BAR - Always visible on desktop, toggle on mobile */}
          <div className="flex flex-col gap-3 mb-3 md:mb-0">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama produk..."
                className={`w-full ${
                  searchQuery ? 'pr-10' : 'pl-10'
                } py-2.5 pl-10 pr-3 md:pr-4 text-xs sm:text-sm bg-white border border-[#E5D3B3] rounded-full outline-none focus:border-[#4A0E17] focus:ring-2 focus:ring-[#4A0E17]/10 transition-all`}
              />
              
              {/* Search Icon */}
              {!searchQuery && (
                <Search 
                  size={16} 
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2B1B17]/40"
                />
              )}
              
              {/* Clear Button */}
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#4A0E17]/10 rounded-full transition-colors"
                  aria-label="Hapus pencarian"
                >
                  <X size={14} className="text-[#2B1B17]/60" />
                </button>
              )}
            </div>

            {/* Horizontal Scrollable Filter - Natural on mobile, centered on desktop */}
            <div className="flex-1 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex gap-2 md:gap-3 md:justify-center w-max md:w-full items-center">
                {/* Search Results Indicator (on mobile only) */}
                {searchQuery && (
                  <div className="shrink-0 text-xs text-[#2B1B17]/60 whitespace-nowrap">
                    {filteredProducts.length} hasil untuk "{searchQuery}"
                  </div>
                )}
                
                
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 px-4 md:px-5 py-2 rounded-full text-xs md:text-sm tracking-wide md:tracking-widest uppercase font-medium transition-all duration-300 whitespace-nowrap ${
                      activeCategory === cat
                        ? "bg-gradient-to-r from-[#4A0E17] to-[#691224] text-[#FDFBF7] shadow-md shadow-[#4A0E17]/20 scale-105"
                        : "border border-[#E5D3B3] text-[#2B1B17] hover:border-[#4A0E17] hover:bg-[#4A0E17]/5"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GRID KATALOG PRODUK - Fully Responsive */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-8">
          
          {isLoading ? (
            // SKELETON LOADING - responsive count
            [...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col h-full">
                <div className="aspect-[3/4] sm:aspect-[4/5] bg-[#E5D3B3]/30 mb-3 sm:mb-5 rounded-xl w-full"></div>
                <div className="h-2.5 sm:h-3 bg-[#E5D3B3]/40 w-1/2 sm:w-1/3 mb-2 sm:mb-3 rounded"></div>
                <div className="h-4 sm:h-5 bg-[#E5D3B3]/40 w-3/4 mb-2 rounded"></div>
                <div className="h-3 sm:h-4 bg-[#E5D3B3]/40 w-1/2 mt-auto rounded"></div>
              </div>
            ))
          ) : filteredProducts.length === 0 ? (
            // EMPTY STATE - Enhanced
            <div className="col-span-full py-16 md:py-20 text-center text-[#2B1B17]/50 font-light border border-dashed border-[#E5D3B3] rounded-2xl">
              <div className="mb-4 text-4xl">🎯</div>
              <p className="text-base md:text-lg mb-3">Tidak ada produk yang cocok.</p>
              <p className="text-sm text-[#2B1B17]/40 mb-6 max-w-md mx-auto">
                Coba kata kunci lain atau hapus semua filter untuk melihat semua produk.
              </p>
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#4A0E17] font-bold hover:text-[#691224] transition-colors px-6 py-3 bg-[#4A0E17]/5 hover:bg-[#4A0E17]/10 rounded-full"
              >
                <ArrowRight size={14} />
                Lihat Semua Produk
              </button>
            </div>
          ) : (
            // REAL DATA DARI SUPABASE - Responsive cards
            filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.04, ease: "easeOut" }}
              >
                <Link href={`/the-collection/${product.id}`} className="group cursor-pointer flex flex-col h-full">
                  {/* Image Container - Adaptive aspect ratio */}
                  <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden bg-[#E5D3B3]/20 mb-3 sm:mb-4 rounded-xl sm:rounded-2xl shadow-sm group-hover:shadow-xl transition-all duration-500">
                    {/* Badge New Produk Otomatis */}
                    {product.is_new === 1 && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 bg-gradient-to-r from-[#4A0E17] to-[#691224] text-[#FDFBF7] text-[8px] sm:text-[10px] uppercase font-bold tracking-widest px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-md">
                        New
                      </div>
                    )}
                    
                    <div
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      style={{ backgroundImage: `url('${product.image_url}')` }}
                    />
                    
                    {/* Hover overlay subtle */}
                    <div className="absolute inset-0 bg-[#4A0E17]/0 group-hover:bg-[#4A0E17]/10 transition-colors duration-500" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex flex-col flex-grow px-0.5 sm:px-0">
                    <span className="text-[8px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest text-[#E5D3B3] font-bold mb-1 sm:mb-1.5">{product.category}</span>
                    <h3 className={`${playfair.className} text-sm sm:text-base md:text-lg font-bold text-[#2B1B17] mb-0.5 sm:mb-1 leading-snug line-clamp-2`}>{product.name}</h3>
                    <p className="text-[10px] sm:text-xs text-[#2B1B17]/60 font-light mb-1.5 sm:mb-2 line-clamp-2">{product.description}</p>
                    <p className="text-sm sm:text-base md:text-lg text-[#4A0E17] font-semibold mt-auto">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}
                    </p>
                    
                    {/* Lihat Detail - always visible on mobile, hover on desktop */}
                    <div className="mt-2 sm:mt-4 flex opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest text-[#4A0E17] font-bold border-b border-[#4A0E17]/50 pb-0.5 sm:pb-1">
                        Lihat Detail <ArrowRight size={10} className="sm:size-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>

        {/* Results counter bottom (mobile only) */}
        {filteredProducts.length > 0 && !isLoading && (
          <div className="md:hidden mt-6 text-center">
            <p className="text-xs text-[#2B1B17]/60">
              Menampilkan {filteredProducts.length} {filteredProducts.length === 1 ? 'hasil' : 'hasil'} 
              {searchQuery && ` untuk "${searchQuery}"`}
              {activeCategory !== "All" && (
                <> dalam kategori <strong>{activeCategory}</strong></>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}