"use client"; 

import { useState, useEffect, useRef } from "react"; 
import { useParams, useRouter } from "next/navigation";
import { Playfair_Display } from "next/font/google"; 
import { ArrowRight, Search, X, ShoppingBag, Plus, CheckCircle2 } from "lucide-react"; 
import Link from "next/link"; 
import { motion, AnimatePresence } from "framer-motion"; 
import { supabase } from "@/lib/supabase"; 
import { useCartStore } from "@/store/useCartStore"; 

const playfair = Playfair_Display({ subsets: ["latin"] }); 
const categories = ["All", "Onde-Onde", "Pastry & Cookies", "Cakes & Lapis", "Savory Snack"]; 

export default function TourCatalogPage() {   
  const params = useParams();
  const router = useRouter();
  const sessionId = params.session_id as string;

  const [activeCategory, setActiveCategory] = useState("All");   
  const [searchQuery, setSearchQuery] = useState("");   
  const [allProducts, setAllProducts] = useState<any[]>([]);   
  const [isLoading, setIsLoading] = useState(true);   
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const { cart, addToCart } = useCartStore();   
  const [isMounted, setIsMounted] = useState(false);   
  
  const [toast, setToast] = useState<string | null>(null);   
  const toastTimer = useRef<NodeJS.Timeout | null>(null);   

  useEffect(() => {
    // refactored logic: cegah akses katalog kalau status udah sukses
    const isDone = localStorage.getItem(`arasa_order_done_${sessionId}`);
    if (isDone) {
      router.push(`/tour-portal/${sessionId}/success`);
      return;
    }

    setIsMounted(true);
    const name = localStorage.getItem("arasa_passenger_name");
    
    // Kalau belum ngisi nama, tendang ke depan
    if (!name) {
      router.push(`/tour-portal/${sessionId}`);
    }     
    setIsMounted(true);     

    // Interceptor: Cek identitas penumpang
    const savedSession = localStorage.getItem("arasa_tour_session");
    const savedName = localStorage.getItem("arasa_passenger_name");

    if (savedSession !== sessionId || !savedName) {
      router.push(`/tour-portal/${sessionId}`);
      return;
    }
    
    setIsAuthorized(true);

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

    if (sessionId) fetchProducts();   
  }, [sessionId, router]);   

  const filteredProducts = allProducts.filter((product) => {     
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;     
    const matchesSearch = searchQuery === "" || product.name.toLowerCase().includes(searchQuery.toLowerCase());     
    return matchesCategory && matchesSearch;   
  });   

  const handleClearSearch = () => {     
    setSearchQuery("");   
  };   

  const handleQuickAdd = (e: React.MouseEvent, product: any) => {     
    e.preventDefault();     
    e.stopPropagation();          
    
    addToCart({       
      id: product.id,       
      name: product.name,       
      price: product.price,       
      qty: 1,       
      image: product.image_url,       
      category: product.category,     
    });     
    
    setToast(`${product.name} masuk keranjang`);          
    
    if (toastTimer.current) clearTimeout(toastTimer.current);     
    toastTimer.current = setTimeout(() => {       
      setToast(null);     
    }, 2000);   
  };   

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);   

  // Hold rendering jika belum validasi local storage
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-[#E5D3B3] border-t-[#4A0E17] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (     
    <div className="bg-[#FDFBF7] min-h-screen relative pb-20">       
      {/* HERO SECTION */}       
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">         
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
            Arasa In-Bus Delivery           
          </span>           
          <h1 className={`${playfair.className} text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#2B1B17] mb-4 md:mb-6 leading-tight`}>             
            Katalog Pesanan
          </h1>           
          <p className="text-sm md:text-base text-[#2B1B17]/70 max-w-xl md:max-w-2xl mx-auto font-light leading-relaxed px-2">             
            Pesan sekarang, barang akan kami siapkan dan antar langsung ke kursi Anda saat bus tiba.           
          </p>         
        </motion.div>       
      </section>       

      {/* STICKY TOOLBAR */}       
      <div className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-y border-[#E5D3B3]/30 shadow-sm">         
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">           
          <div className="flex flex-col gap-3 mb-3 md:mb-0">             
            <div className="relative">               
              <input                 
                type="text"                 
                value={searchQuery}                 
                onChange={(e) => setSearchQuery(e.target.value)}                 
                placeholder="Cari nama produk..."                 
                className={`w-full ${searchQuery ? 'pr-10' : 'pl-10'} py-2.5 pl-10 pr-3 md:pr-4 text-xs sm:text-sm bg-white border border-[#E5D3B3] rounded-full outline-none focus:border-[#4A0E17] focus:ring-2 focus:ring-[#4A0E17]/10 transition-all`}               
              />               
              {!searchQuery && (                 
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2B1B17]/40" />               
              )}               
              {searchQuery && (                 
                <button                   
                  onClick={handleClearSearch}                   
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#4A0E17]/10 rounded-full transition-colors"                 
                >                   
                  <X size={14} className="text-[#2B1B17]/60" />                 
                </button>               
              )}             
            </div>                          
            <div className="flex-1 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">               
              <div className="flex gap-2 md:gap-3 md:justify-center w-max md:w-full items-center">                 
                {searchQuery && (                   
                  <div className="shrink-0 text-xs text-[#2B1B17]/60 whitespace-nowrap">                     
                    {filteredProducts.length} hasil                   
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

      {/* GRID KATALOG */}       
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">         
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-8">           
          {isLoading ? (             
            [...Array(8)].map((_, i) => (               
              <div key={i} className="animate-pulse flex flex-col h-full">                 
                <div className="aspect-[3/4] sm:aspect-[4/5] bg-[#E5D3B3]/30 mb-3 sm:mb-5 rounded-xl w-full"></div>                 
                <div className="h-2.5 sm:h-3 bg-[#E5D3B3]/40 w-1/2 sm:w-1/3 mb-2 sm:mb-3 rounded"></div>                 
                <div className="h-4 sm:h-5 bg-[#E5D3B3]/40 w-3/4 mb-2 rounded"></div>                 
                <div className="h-3 sm:h-4 bg-[#E5D3B3]/40 w-1/2 mt-auto rounded"></div>               
              </div>             
            ))           
          ) : filteredProducts.length === 0 ? (             
            <div className="col-span-full py-16 md:py-20 text-center text-[#2B1B17]/50 font-light border border-dashed border-[#E5D3B3] rounded-2xl">               
              <p className="text-base md:text-lg mb-3">Tidak ada produk yang cocok.</p>               
              <button                 
                onClick={() => {                   
                  setSearchQuery("");                   
                  setActiveCategory("All");                 
                }}                 
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#4A0E17] font-bold px-6 py-3 bg-[#4A0E17]/5 hover:bg-[#4A0E17]/10 rounded-full transition-all"               
              >                 
                <ArrowRight size={14} /> Lihat Semua Produk               
              </button>             
            </div>           
          ) : (             
            filteredProducts.map((product, index) => (               
              <motion.div                 
                key={product.id}                 
                initial={{ opacity: 0, y: 30 }}                 
                whileInView={{ opacity: 1, y: 0 }}                 
                viewport={{ once: true, margin: "-50px" }}                 
                transition={{ duration: 0.6, delay: index * 0.04, ease: "easeOut" }}                 
                className="group flex flex-col h-full bg-white rounded-2xl sm:rounded-3xl border border-[#E5D3B3]/30 shadow-sm hover:shadow-xl hover:border-[#4A0E17]/30 transition-all duration-500 overflow-hidden"               
              >                 
                {/* REFACTORED LOGIC: Sesuaikan routing link produk dinamis */}
                <Link href={`/tour-portal/${sessionId}/catalog/${product.id}`} className="flex flex-col flex-grow p-2.5 sm:p-3">                   
                  <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden bg-[#E5D3B3]/20 mb-3 sm:mb-4 rounded-xl sm:rounded-2xl">                     
                    {product.is_new === 1 && (                       
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 bg-gradient-to-r from-[#4A0E17] to-[#691224] text-[#FDFBF7] text-[8px] sm:text-[10px] uppercase font-bold tracking-widest px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-md">                         
                        New                       
                      </div>                     
                    )}                     
                    <div                       
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-out"                       
                      style={{ backgroundImage: `url('${product.image_url}')` }}                     
                    />                     
                    <div className="absolute inset-0 bg-[#4A0E17]/0 group-hover:bg-[#4A0E17]/10 transition-colors duration-500" />                   
                  </div>                                      
                  <div className="flex flex-col flex-grow px-1">                     
                    <span className="text-[8px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest text-[#E5D3B3] font-bold mb-1 sm:mb-1.5">{product.category}</span>                     
                    <h3 className={`${playfair.className} text-sm sm:text-base md:text-lg font-bold text-[#2B1B17] mb-0.5 sm:mb-1 leading-snug line-clamp-2`}>{product.name}</h3>                     
                    <p className="text-[10px] sm:text-xs text-[#2B1B17]/60 font-light mb-1.5 sm:mb-2 line-clamp-2">{product.description}</p>                   
                  </div>                 
                </Link>                 
                <div className="px-3.5 sm:px-4 pb-3 sm:pb-4 mt-auto">                   
                  <div className="flex items-end justify-between border-t border-[#E5D3B3]/40 pt-3">                     
                    <div>                       
                      <p className="text-sm sm:text-base md:text-lg text-[#4A0E17] font-semibold mb-1">                         
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}                       
                      </p>                       
                        <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest text-[#2B1B17]/50 font-bold">
                          Tersedia di katalog <ArrowRight size={10} className="sm:size-3" />
                        </span>
                    </div>                                          
                    <button                       
                      onClick={(e) => handleQuickAdd(e, product)}                       
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FDFBF7] border border-[#E5D3B3] text-[#4A0E17] flex items-center justify-center hover:bg-[#4A0E17] hover:border-[#4A0E17] hover:text-[#FDFBF7] transition-all group/btn shadow-sm"                       
                      aria-label="Tambah ke Keranjang"                     
                    >                       
                      <Plus size={16} className="group-hover/btn:scale-110 transition-transform" />                     
                    </button>                   
                  </div>                 
                </div>               
              </motion.div>             
            ))           
          )}         
        </div>       
      </div>       

      {/* TOAST NOTIFICATION */}       
      <AnimatePresence>         
        {toast && (           
          <motion.div             
            initial={{ opacity: 0, y: 50, scale: 0.9 }}             
            animate={{ opacity: 1, y: 0, scale: 1 }}             
            exit={{ opacity: 0, y: 20, scale: 0.9 }}             
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[60] bg-[#2B1B17] text-[#FDFBF7] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 whitespace-nowrap border border-[#E5D3B3]/20"           
          >             
            <CheckCircle2 size={18} className="text-[#00AA5B]" />             
            <span className="text-xs sm:text-sm font-medium">{toast}</span>           
          </motion.div>         
        )}       
      </AnimatePresence>       

      {/* FLOATING CART BUTTON */}       
      {isMounted && totalItems > 0 && (         
        <motion.div            
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}           
          // refactored logic: ubah bottom-6 jadi bottom-24 khusus mobile, sm:bottom-8 buat layar gede
          className="fixed bottom-24 sm:bottom-8 right-4 sm:right-8 z-50"         
        >           
          <Link href={`/tour-portal/${sessionId}/checkout`} className="flex items-center gap-3 bg-[#4A0E17] text-[#FDFBF7] px-6 py-4 rounded-full shadow-2xl hover:bg-[#2B1B17] hover:scale-105 transition-all group border border-[#4A0E17]/20">             
            <div className="relative">               
              <ShoppingBag size={20} />               
              <span className="absolute -top-2 -right-3 bg-[#E5D3B3] text-[#4A0E17] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#4A0E17]">                 
                {totalItems}               
              </span>             
            </div>             
            <span className="text-sm font-bold uppercase tracking-widest hidden sm:block">Checkout</span>           
          </Link>         
        </motion.div>       
      )}  
    </div>   
  );
}