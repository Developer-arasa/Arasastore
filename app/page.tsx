"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star, MapPin, Clock, ShieldCheck, Award } from "lucide-react";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
// koneksi supabase
import { supabase } from "@/lib/supabase";

const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });

export default function Home() {
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [bestProducts, setBestProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        setIsLoading(true);
        
        // Eksekusi API secara paralel (bersamaan) biar ngebut
        const [newRes, bestRes] = await Promise.all([
          supabase.from('products').select('*').eq('is_new', 1).order('created_at', { ascending: false }).limit(4),
          supabase.from('products').select('*').eq('is_best_product', 1).order('created_at', { ascending: false }).limit(3)
        ]);

        if (newRes.data) setNewProducts(newRes.data);
        if (bestRes.data) setBestProducts(bestRes.data);
        
      } catch (error) {
        console.error("Gagal menarik data Homepage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomepageData();
  }, []);

  return (
    <>
      {/* HERO SECTION - Professional Store Vibe */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Solid Gradient Background instead of Image */}
        {/* Image Background */}
<div className="absolute inset-0 bg-cover bg-bottom" style={{ backgroundImage: "url('https://kqfaqftlpivwhfdwqrwt.supabase.co/storage/v1/object/public/dll/Parkingspace.webp')" }} />

<div className="absolute inset-0 bg-[#000000]/25" />
{/* Gradient Overlay (Merah ke Transparan) */}
<div className="absolute inset-0 bg-[#4A0E17]/80" />
        
        {/* Animated Subtle Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #E5D3B3 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          {/* Decorative Top Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="inline-block mb-8"
          >
            <span className="text-[#E5D3B3] uppercase tracking-[0.4em] text-xs font-semibold px-6 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-[#E5D3B3]/20 shadow-lg">
              Pusat Oleh-Oleh Mojokerto
            </span>
          </motion.div>
          
          <h1 className={`${playfair.className} text-4xl md:text-6xl lg:text-7xl font-bold text-[#FDFBF7] mb-8 leading-tight drop-shadow-lg`}>
            Persinggahan Nyaman, <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-[#E5D3B3] via-[#FDFBF7] to-[#E5D3B3] bg-clip-text text-transparent">Buah Tangan Berkesan.</span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-base md:text-xl text-[#FDFBF7]/90 mb-10 max-w-3xl mx-auto font-light leading-relaxed"
          >
            Destinasi persinggahan ternyaman di jalur utama dengan pilihan produk kuliner berkualitas tinggi untuk keluarga tercinta.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            <Link href="/the-collection" className="group inline-flex items-center gap-3 bg-[#E5D3B3] text-[#4A0E17] hover:bg-[#FDFBF7] px-10 py-4.5 rounded-full font-bold transition-all shadow-xl hover:shadow-2xl hover:scale-105 duration-300 transform border border-[#E5D3B3]/50">
              <span className="uppercase tracking-widest text-sm">Jelajahi Produk Kami</span>
              <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION INFORMASI UTAMA */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto mb-24"
        >
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="inline-block text-xs uppercase tracking-[0.3em] text-[#4A0E17] font-bold px-4 py-1.5 bg-[#4A0E17]/5 rounded-full mb-6"
          >
            Kemudahan, Kenyamanan, dan Cinta
          </motion.span>
          
          <h2 className={`${playfair.className} text-3xl md:text-5xl lg:text-6xl font-bold text-[#4A0E17] mb-6 leading-tight`}>
            Semua Ada Disini
          </h2>
          
          <p className="text-[#2B1B17]/80 text-base leading-relaxed font-light">
            Arasa Store dirancang bukan sekadar tempat berbelanja, melainkan ruang peristirahatan yang nyaman bagi pelintas jalan dengan fokus penuh pada kualitas produk premium.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl group bg-[#E5D3B3]/20 border border-[#E5D3B3]/40"
          >
            {/* Tempat untuk gambar kualitas/toko */}
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: "url('https://kqfaqftlpivwhfdwqrwt.supabase.co/storage/v1/object/public/dll/mAIN.webp')" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2B1B17]/40 via-transparent to-transparent opacity-60" />
            
            <div className="absolute top-6 right-6 bg-[#4A0E17]/90 backdrop-blur-sm text-[#FDFBF7] px-5 py-3 rounded-xl shadow-lg border border-[#E5D3B3]/30">
              <span className="text-xs uppercase tracking-widest font-bold">Since 2012</span>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            className="lg:pl-10"
          >
            <h3 className={`${playfair.className} text-3xl md:text-4xl font-bold text-[#4A0E17] mb-6`}>
              Kualitas yang Terjaga <br/>Sejak 2012
            </h3>
            
            <p className="text-[#2B1B17]/80 mb-8 leading-relaxed text-lg">
              Setiap produk dibuat oleh tangan-tangan ahli dan diperhatikan secara penuh sebagai warisan yang terus dijaga. Warisan kuliner yang tak lekang oleh waktu.
            </p>
            
            <ul className="space-y-5 text-[#2B1B17]">
              {[
                { icon: ShieldCheck, text: "Cita rasa autentik yang tak lekang waktu" },
                { icon: Award, text: "Bahan baku premium pilihan terbaik" },
                { icon: Star, text: "Resep tradisional yang dijaga ketat" }
              ].map((item, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 + index * 0.15 }}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#E5D3B3]/30 shadow-sm hover:shadow-md hover:border-[#4A0E17]/50 transition-all duration-300"
                >
                  <item.icon className="text-[#4A0E17]" size={24} />
                  <span className="font-medium">{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Jam Operasional */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { name: "Arasa Pusat", location: "Jl. Raya By Pass No.km 50, Jokodayo", time: "06.00 - 21.00 WIB" },
              { name: "Arasa Raden Wijaya", location: "Jl. Raden Wijaya No.5A, Gatul", time: "07.00 - 21.00 WIB" },
              { name: "Arasa Stasiun Mojokerto", location: "Stasiun kereta api Mojokerto", time: "07.00 - 21.00 WIB" }
            ].map((branch, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="group relative bg-gradient-to-br from-[#FDFBF7] to-[#F5F0E6] p-8 rounded-3xl border border-[#E5D3B3]/40 shadow-sm hover:shadow-2xl hover:border-[#4A0E17]/50 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#4A0E17]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <MapPin className="mx-auto text-[#4A0E17] mb-4" size={28} />
                <h4 className="font-bold text-[#2B1B17] mb-3 text-center">{branch.name}</h4>
                <p className="text-sm text-[#2B1B17]/70 font-light text-center mb-4">{branch.location}</p>
                <div className="flex items-center justify-center gap-2 text-[#4A0E17] font-semibold">
                  <Clock size={16} />
                  <span>{branch.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* RELAX SPACE GALLERY - Blank Canvas */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#F5F0E6]/30 border-y border-[#E5D3B3]/30">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <span className="inline-block text-xs uppercase tracking-[0.3em] text-[#4A0E17] font-bold px-4 py-1.5 bg-[#4A0E17]/5 rounded-full mb-6">
            Fasilitas Premium
          </span>
          <h2 className={`${playfair.className} text-3xl md:text-5xl lg:text-6xl font-bold text-[#4A0E17] mb-6`}>
            Ruang Singgah Nyaman
          </h2>
          <p className="text-[#2B1B17]/80 text-base leading-relaxed font-light">
            Nikmati momen istirahat yang nyaman di Ruang Singgah kami.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[800px] md:h-[600px]">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full rounded-3xl overflow-hidden relative group bg-[#E5D3B3]/20 shadow-sm border border-[#E5D3B3]/40"
          >
            {/* Paste link URL Lounge Area di sini */}
            <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-800 ease-out" style={{ backgroundImage: "url('')" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2B1B17]/40 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-6 left-6 text-[#FDFBF7]">
              <p className="text-xs uppercase tracking-widest font-bold">Waiting Space</p>
            </div>
          </motion.div>
          
          <div className="grid grid-rows-2 gap-8 h-full">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
              className="rounded-3xl overflow-hidden relative group bg-[#E5D3B3]/20 shadow-sm border border-[#E5D3B3]/40"
            >
              
              <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-800 ease-out" style={{ backgroundImage: "url('https://kqfaqftlpivwhfdwqrwt.supabase.co/storage/v1/object/public/dll/couple%20space%20copy.webp')" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2B1B17]/40 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-6 left-6 text-[#FDFBF7]">
                <p className="text-xs uppercase tracking-widest font-bold">Couple Space</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
              className="rounded-3xl overflow-hidden relative group bg-[#E5D3B3]/20 shadow-sm border border-[#E5D3B3]/40"
            >
              {/* Paste link URL Relaxation Zone di sini */}
              <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-800 ease-out" style={{ backgroundImage: "url('https://kqfaqftlpivwhfdwqrwt.supabase.co/storage/v1/object/public/dll/Parkingspace.webp')" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2B1B17]/40 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-6 left-6 text-[#FDFBF7]">
                <p className="text-xs uppercase tracking-widest font-bold">Parking Space</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* NEW COLLECTION */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#E5D3B3]/30">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8"
        >
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-[#4A0E17] font-bold block mb-3">
              Eksklusif Rilis Terbaru
            </span>
            <h2 className={`${playfair.className} text-3xl md:text-5xl lg:text-6xl font-bold text-[#4A0E17]`}>
              New Collection
            </h2>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <Link href="/the-collection" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-[#2B1B17] font-bold border-b-2 border-[#2B1B17] pb-1.5 hover:text-[#4A0E17] hover:border-[#4A0E17] transition-colors group">
              Lihat Semua Katalog 
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col h-full">
                <div className="aspect-[4/5] bg-[#E5D3B3]/30 mb-6 rounded-2xl w-full"></div>
                <div className="h-3 bg-[#E5D3B3]/40 w-1/3 mb-4 rounded"></div>
                <div className="h-5 bg-[#E5D3B3]/40 w-3/4 mb-2 rounded"></div>
                <div className="h-4 bg-[#E5D3B3]/40 w-1/2 mt-auto mb-3 rounded"></div>
                <div className="h-4 bg-[#E5D3B3]/40 w-2/3 rounded"></div>
              </div>
            ))
          ) : newProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-[#2B1B17]/50 font-light border-2 border-dashed border-[#E5D3B3] rounded-3xl">
              Belum ada koleksi rilis terbaru saat ini.
            </div>
          ) : (
            newProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1, delay: index * 0.15, ease: "easeOut" }}
                className="group cursor-pointer flex flex-col h-full"
              >
                <Link href={`/the-collection/${product.id}`} className="flex flex-col flex-grow">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#E5D3B3]/10 mb-6 rounded-2xl shadow-sm group-hover:shadow-2xl transition-all duration-500 border border-[#E5D3B3]/20">
                    <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-[#4A0E17] to-[#691224] text-[#FDFBF7] text-[10px] uppercase font-bold tracking-widest px-4 py-2 rounded-full shadow-lg">
                      New
                    </div>
                    <div className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-800 ease-out" style={{ backgroundImage: `url('${product.image_url}')` }} />
                    <div className="absolute inset-0 bg-[#4A0E17]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  
                  <div className="flex flex-col flex-grow">
                    <span className="text-[10px] uppercase tracking-widest text-[#E5D3B3] font-bold mb-2.5">{product.category}</span>
                    <h3 className={`${playfair.className} text-xl font-bold text-[#2B1B17] mb-2 leading-tight line-clamp-2`}>{product.name}</h3>
                    <p className="text-xs text-[#2B1B17]/60 font-light mb-3 line-clamp-3">{product.description}</p>
                    
                    <div className="mt-auto">
                      <p className="text-[#4A0E17] font-semibold text-lg">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}
                      </p>
                      <div className="mt-5 flex opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                        <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#2B1B17] font-bold border-b-2 border-[#2B1B17] pb-1 hover:text-[#4A0E17] hover:border-[#4A0E17] transition-colors">
                          Lihat Detail <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* THE FAVORITE CHOICE */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F5F0E6]/50 to-[#FDFBF7]">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-center mb-20"
          >
            <h2 className={`${playfair.className} text-3xl md:text-4xl lg:text-5xl font-bold text-[#4A0E17] mb-4`}>
              The Favorite Choice
            </h2>
            <p className="text-[#2B1B17]/70 font-light max-w-2xl mx-auto">
              Kurasi produk favorit pilihan pelanggan yang wajib dibawa pulang.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white border border-[#E5D3B3]/60 rounded-3xl overflow-hidden h-full shadow-sm">
                  <div className="h-72 bg-[#E5D3B3]/30 w-full mb-8"></div>
                  <div className="p-8">
                    <div className="flex gap-1 mb-4 text-[#E5D3B3]/50">
                      {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                    </div>
                    <div className="h-2 bg-[#E5D3B3]/40 w-1/4 mb-4 rounded"></div>
                    <div className="h-7 bg-[#E5D3B3]/40 w-3/4 rounded"></div>
                  </div>
                </div>
              ))
            ) : bestProducts.length === 0 ? (
              <div className="col-span-full py-8 text-center text-[#2B1B17]/50 font-light">
                Belum ada produk favorit terpilih.
              </div>
            ) : (
              bestProducts.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 1.2, delay: index * 0.2, ease: "easeOut" }}
                >
                  <Link href={`/the-collection/${item.id}`} className="block group relative bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl border border-[#E5D3B3]/40">
                    <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-[#4A0E17] fill-current" />)}
                    </div>
                    
                    <div className="h-72 bg-[#E5D3B3]/20 w-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-800" style={{ backgroundImage: `url('${item.image_url}')` }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    
                    <div className="p-8 flex flex-col flex-grow">
                      <span className="text-[10px] uppercase tracking-widest text-[#E5D3B3] font-bold mb-2.5 block">{item.category}</span>
                      <h3 className={`${playfair.className} text-2xl font-bold text-[#2B1B17] mb-3 leading-tight`}>{item.name}</h3>
                      <p className="text-[#4A0E17] font-semibold mb-6">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price)}</p>
                      
                      <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 pt-6 border-t border-[#E5D3B3]/30 mt-auto">
                        <span className="flex items-center gap-2 text-sm uppercase tracking-widest text-[#2B1B17] font-bold hover:text-[#4A0E17] transition-colors">
                          Lihat Detail <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}