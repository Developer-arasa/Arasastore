"use client";

import { useState, useEffect } from "react";
import { Playfair_Display } from "next/font/google";
import { MapPin, Briefcase, CheckCircle, ChevronRight, Armchair } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
// Koneksi Supabase
import { supabase } from "@/lib/supabase";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function CareerPage() {
  // State untuk Supabase
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        // Tarik data lowongan yang statusnya masih aktif (1)
        const { data, error } = await supabase
          .from('careers')
          .select('*')
          .eq('is_active', 1)
          .order('created_at', { ascending: false });

        if (data && !error) {
          setJobs(data);
        }
      } catch (error) {
        console.error("Gagal menarik data lowongan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="bg-[#FDFBF7] min-h-screen py-16">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs uppercase tracking-[0.3em] text-[#4A0E17] font-bold block mb-4"
        >
          Bergabung Bersama Kami
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${playfair.className} text-4xl md:text-6xl font-bold text-[#2B1B17] mb-6`}
        >
          Join the Legacy
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[#2B1B17]/70 max-w-2xl mx-auto font-light leading-relaxed"
        >
          Kami mengundang talenta-talenta terbaik untuk tumbuh bersama Arasa Store. Ciptakan pengalaman premium dan bawa kebahagiaan bagi setiap pengunjung kami.
        </motion.p>
      </div>

      {/* Daftar Lowongan */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          // SKELETON LOADING
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-[#E5D3B3]/60 rounded-2xl p-8 animate-pulse h-[500px] flex flex-col">
                <div className="w-24 h-6 bg-[#E5D3B3]/40 rounded-full mb-4"></div>
                <div className="w-3/4 h-8 bg-[#E5D3B3]/40 rounded mb-3"></div>
                <div className="w-1/2 h-4 bg-[#E5D3B3]/40 rounded mb-8"></div>
                <div className="space-y-3 mb-8">
                  <div className="w-full h-4 bg-[#E5D3B3]/40 rounded"></div>
                  <div className="w-5/6 h-4 bg-[#E5D3B3]/40 rounded"></div>
                </div>
                <div className="mt-auto w-full h-12 bg-[#E5D3B3]/40 rounded-full"></div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          // EMPTY STATE - ANIMASI KURSI KOSONG
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="py-24 text-center flex flex-col items-center justify-center border border-dashed border-[#E5D3B3] rounded-3xl bg-white/50"
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <Armchair size={80} strokeWidth={1} className="text-[#4A0E17]/30 mb-8 drop-shadow-sm" />
            </motion.div>
            <h3 className={`${playfair.className} text-3xl font-bold text-[#4A0E17] mb-3`}>
              Tidak Ada Kursi Kosong
            </h3>
            <p className="text-[#2B1B17]/60 font-light max-w-md mx-auto">
              Saat ini seluruh posisi di Arasa Store telah terisi oleh talenta terbaik. Pantau terus halaman ini untuk kesempatan berikutnya.
            </p>
          </motion.div>
        ) : (
          // DATA REAL DARI SUPABASE
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {jobs.map((job, index) => (
              <motion.div 
                key={job.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white border border-[#E5D3B3]/60 rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300 flex flex-col h-full group"
              >
                <div className="mb-6 pb-6 border-b border-[#E5D3B3]/40">
                  <span className="inline-block bg-[#E5D3B3]/30 text-[#4A0E17] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                    {job.type}
                  </span>
                  <h2 className={`${playfair.className} text-2xl font-bold text-[#2B1B17] mb-3`}>
                    {job.title}
                  </h2>
                  <div className="flex items-center text-[#2B1B17]/70 text-sm font-medium gap-2">
                    <MapPin size={16} className="text-[#4A0E17]" /> {job.placement}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#2B1B17] mb-3 flex items-center gap-2">
                    <Briefcase size={16} className="text-[#4A0E17]" /> Kualifikasi
                  </h3>
                  <ul className="space-y-3">
                    {job.qualifications.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-[#2B1B17]/80 font-light leading-relaxed">
                        <CheckCircle size={16} className="text-[#4A0E17] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-8 flex-grow">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#2B1B17] mb-3 flex items-center gap-2">
                    <CheckCircle size={16} className="text-[#4A0E17]" /> Benefit
                  </h3>
                  <ul className="space-y-3">
                    {job.benefits.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-[#2B1B17]/80 font-light leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#E5D3B3] shrink-0 mt-1.5"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-6">
                  <Link href={`mailto:hr@arasastore.com?subject=Lamaran: ${job.title} - ${job.placement}`} className="w-full inline-flex justify-center items-center gap-2 bg-[#FDFBF7] border border-[#2B1B17] hover:bg-[#2B1B17] hover:text-[#FDFBF7] text-[#2B1B17] px-6 py-3 rounded-full text-sm font-medium uppercase tracking-widest transition-all">
                    Apply Now <ChevronRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}