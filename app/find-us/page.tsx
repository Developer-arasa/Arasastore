"use client";

import { Playfair_Display } from "next/font/google";
import { MapPin, MessageCircle, ShoppingBag, Navigation, Store, Clock, Music2, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function FindUsPage() {
  
  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.7, ease: "easeOut" as const }
  };

  return (
    <div className="bg-[#FDFBF7] min-h-screen">
      
      {/* HERO SECTION */}
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
            Hubungi & Kunjungi Kami
          </span>
          <h1 className={`${playfair.className} text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#2B1B17] mb-4 md:mb-6 leading-tight`}>
            Find Arasa
          </h1>
          <p className="text-sm md:text-base text-[#2B1B17]/70 max-w-xl md:max-w-2xl mx-auto font-light leading-relaxed px-2">
            Pesan secara online, sapa kami melalui layanan pelanggan, atau kunjungi langsung galeri premium kami di Mojokerto.
          </p>
        </motion.div>
      </section>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* ============ KOLOM KIRI: Kontak Digital ============ */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* WhatsApp Admin - Highlight Card */}
            <motion.div {...fadeUp}>
              <div className="bg-gradient-to-br from-[#4A0E17] to-[#691224] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-[#FDFBF7] shadow-lg shadow-[#4A0E17]/20">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 bg-[#FDFBF7]/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <MessageCircle size={22} />
                  </div>
                  <h3 className={`${playfair.className} text-xl sm:text-2xl font-bold`}>
                    Layanan Pelanggan
                  </h3>
                </div>
                <p className="text-[#FDFBF7]/80 text-sm font-light mb-5 leading-relaxed">
                  Butuh bantuan? Tim kami siap membantu Anda melalui WhatsApp.
                </p>
                <a 
                  href="https://wa.me/628155138385" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 bg-[#FDFBF7] text-[#4A0E17] px-5 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform"
                >
                  <MessageCircle size={18} className="text-[#25D366]" />
                  +62 815-5138-385
                  <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </motion.div>

            {/* Media Sosial */}
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
              <h3 className={`${playfair.className} text-xl sm:text-2xl font-bold text-[#2B1B17] border-b border-[#E5D3B3] pb-4 mb-5`}>
                Media Sosial
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <a 
                  href="https://www.instagram.com/arasastore/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group flex flex-col items-center justify-center gap-2 bg-white border border-[#E5D3B3]/60 py-6 rounded-2xl hover:border-[#4A0E17] hover:shadow-lg transition-all text-[#2B1B17]"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">Instagram</span>
                </a>
                <a 
                  href="https://www.tiktok.com/@arasastore" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group flex flex-col items-center justify-center gap-2 bg-white border border-[#E5D3B3]/60 py-6 rounded-2xl hover:border-[#4A0E17] hover:shadow-lg transition-all text-[#2B1B17]"
                >
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Music2 size={22} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">TikTok</span>
                </a>
              </div>
            </motion.div>

            {/* Pesan Online */}
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
              <h3 className={`${playfair.className} text-xl sm:text-2xl font-bold text-[#2B1B17] border-b border-[#E5D3B3] pb-4 mb-5`}>
                Pesan Online
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <a 
                  href="https://shopee.co.id/arasa.storee?categoryId=100629&entryPoint=ShopByPDP&itemId=27015944698" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between bg-white border border-[#E5D3B3]/60 p-4 sm:p-5 rounded-2xl hover:border-[#EE4D2D] hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#EE4D2D]/10 text-[#EE4D2D] rounded-full flex items-center justify-center">
                      <ShoppingBag size={20} />
                    </div>
                    <span className="font-bold text-[#2B1B17] uppercase tracking-wider text-xs sm:text-sm">Shopee Official</span>
                  </div>
                  <ArrowUpRight size={18} className="text-[#2B1B17]/30 group-hover:text-[#EE4D2D] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>

                <a 
                  href="https://gofood.link/a/CMw8oaw" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between bg-white border border-[#E5D3B3]/60 p-4 sm:p-5 rounded-2xl hover:border-[#00AA5B] hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#00AA5B]/10 text-[#00AA5B] rounded-full flex items-center justify-center">
                      <Store size={20} />
                    </div>
                    <span className="font-bold text-[#2B1B17] uppercase tracking-wider text-xs sm:text-sm">GoFood Arasa Pusat</span>
                  </div>
                  <ArrowUpRight size={18} className="text-[#2B1B17]/30 group-hover:text-[#00AA5B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>

                <a 
                  href="https://gofood.co.id/id/mojokerto/restaurant/rumah-oleh-oleh-arasa-prajurit-kulon-23342517-48ac-4aff-9479-c8dd7d43a06e" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between bg-white border border-[#E5D3B3]/60 p-4 sm:p-5 rounded-2xl hover:border-[#00AA5B] hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#00AA5B]/10 text-[#00AA5B] rounded-full flex items-center justify-center">
                      <Store size={20} />
                    </div>
                    <span className="font-bold text-[#2B1B17] uppercase tracking-wider text-xs sm:text-sm">GoFood Arasa Raden Wijaya</span>
                  </div>
                  <ArrowUpRight size={18} className="text-[#2B1B17]/30 group-hover:text-[#00AA5B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>
              </div>
            </motion.div>

          </div>

          {/* ============ KOLOM KANAN: Lokasi Toko Fisik ============ */}
          <div className="lg:col-span-7">
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
              <div className="flex items-center gap-3 mb-6">
                <MapPin size={24} className="text-[#4A0E17]" />
                <h3 className={`${playfair.className} text-xl sm:text-2xl font-bold text-[#2B1B17]`}>
                  Lokasi Cabang
                </h3>
              </div>
            </motion.div>
            
            <div className="space-y-4 sm:space-y-5">
              
              {/* Cabang Pusat */}
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
                <div className="bg-white border border-[#E5D3B3]/60 p-5 sm:p-7 rounded-2xl sm:rounded-3xl hover:shadow-xl hover:border-[#E5D3B3] transition-all group">
                  <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-[#4A0E17]/5 text-[#4A0E17] rounded-xl flex items-center justify-center">
                        <MapPin size={20} className="sm:size-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-base sm:text-lg font-bold text-[#4A0E17]">Arasa Pusat</h4>
                          <span className="text-[9px] uppercase tracking-widest font-bold bg-[#4A0E17] text-[#FDFBF7] px-2 py-0.5 rounded-full">Utama</span>
                        </div>
                        <p className="text-[#2B1B17]/70 font-light leading-relaxed text-xs sm:text-sm">
                          Jl. Raya By Pass No.km 50, Jokodayo, Mojokerto, Kec. Mojoanyar, Kota Mojokerto, Jawa Timur 61321
                        </p>
                      </div>
                    </div>
                    <div className="sm:self-center shrink-0 pl-14 sm:pl-0">
                      <a 
                        href="https://maps.google.com/?q=Arasa+Pusat+Jl.+Raya+By+Pass+Mojokerto" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#2B1B17] text-[#FDFBF7] px-5 py-2.5 rounded-full text-[10px] sm:text-xs font-medium uppercase tracking-widest hover:bg-[#4A0E17] transition-colors"
                      >
                        <Navigation size={14} /> Get Directions
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Cabang Raden Wijaya */}
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }}>
                <div className="bg-white border border-[#E5D3B3]/60 p-5 sm:p-7 rounded-2xl sm:rounded-3xl hover:shadow-xl hover:border-[#E5D3B3] transition-all group">
                  <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-[#4A0E17]/5 text-[#4A0E17] rounded-xl flex items-center justify-center">
                        <MapPin size={20} className="sm:size-6" />
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-[#4A0E17] mb-2">Arasa Raden Wijaya</h4>
                        <p className="text-[#2B1B17]/70 font-light leading-relaxed text-xs sm:text-sm">
                          Jl. Raden Wijaya No.5A, Gatul, Banjaragung, Kec. Puri, Kota Mojokerto, Jawa Timur 61321
                        </p>
                      </div>
                    </div>
                    <div className="sm:self-center shrink-0 pl-14 sm:pl-0">
                      <a 
                        href="https://maps.google.com/?q=Arasa+Raden+Wijaya+Mojokerto" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#2B1B17] text-[#FDFBF7] px-5 py-2.5 rounded-full text-[10px] sm:text-xs font-medium uppercase tracking-widest hover:bg-[#4A0E17] transition-colors"
                      >
                        <Navigation size={14} /> Get Directions
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Cabang Stasiun */}
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.4 }}>
                <div className="bg-white border border-[#E5D3B3]/60 p-5 sm:p-7 rounded-2xl sm:rounded-3xl hover:shadow-xl hover:border-[#E5D3B3] transition-all group">
                  <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-[#4A0E17]/5 text-[#4A0E17] rounded-xl flex items-center justify-center">
                        <MapPin size={20} className="sm:size-6" />
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-[#4A0E17] mb-2">Arasa Stasiun</h4>
                        <p className="text-[#2B1B17]/70 font-light leading-relaxed text-xs sm:text-sm">
                          Stasiun kereta api Mojokerto (ruang tunggu). Jl. Bhayangkara No.18, Mergelo, Miji, Kec. Prajurit Kulon, Kota Mojokerto, Jawa Timur 61322
                        </p>
                      </div>
                    </div>
                    <div className="sm:self-center shrink-0 pl-14 sm:pl-0">
                      <a 
                        href="https://maps.google.com/?q=Stasiun+Mojokerto+Jl.+Bhayangkara" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#2B1B17] text-[#FDFBF7] px-5 py-2.5 rounded-full text-[10px] sm:text-xs font-medium uppercase tracking-widest hover:bg-[#4A0E17] transition-colors"
                      >
                        <Navigation size={14} /> Get Directions
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Jam Operasional Card */}
              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.5 }}>
                <div className="bg-gradient-to-r from-[#E5D3B3]/30 to-[#FDFBF7] border border-[#E5D3B3]/50 p-5 sm:p-6 rounded-2xl sm:rounded-3xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#4A0E17] text-[#FDFBF7] rounded-full flex items-center justify-center">
                      <Clock size={20} />
                    </div>
                    <div>
                      <span className="block text-xs font-bold uppercase tracking-widest text-[#2B1B17]/50 mb-0.5">Jam Operasional</span>
                      <span className="text-sm sm:text-base font-semibold text-[#2B1B17]">Setiap Hari · 08:00 – 21:00 WIB</span>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}