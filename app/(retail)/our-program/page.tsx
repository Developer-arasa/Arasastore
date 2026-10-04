"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChefHat, Users, Clock, CheckCircle, X } from "lucide-react";
import { Playfair_Display } from "next/font/google";
import { supabase } from "@/lib/supabase";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function OurProgramPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('programs')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && !error) {
          setPrograms(data);
        }
      } catch (error) {
        console.error("Gagal menarik data program:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  const openModal = (prog: any) => {
    setSelectedProgram(prog);
    setIsModalOpen(true);
  };

  const featuredProgram = programs.length > 0 ? programs[0] : null;
  const otherPrograms = programs.length > 1 ? programs.slice(1) : [];

  return (
    <div className="bg-[#FDFBF7] min-h-screen py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center"
      >
        <span className="text-xs uppercase tracking-[0.3em] text-[#4A0E17] font-bold block mb-4">
          Pengalaman Interaktif
        </span>
        <h1 className={`${playfair.className} text-4xl md:text-6xl font-bold text-[#2B1B17] mb-6`}>
          Arasa Programs
        </h1>
        <p className="text-[#2B1B17]/70 max-w-2xl mx-auto font-light leading-relaxed">
          Selami lebih dalam warisan rasa kami melalui kelas interaktif dan program eksklusif yang dirancang khusus untuk Anda.
        </p>
      </motion.div>

      {/* FEATURED PROGRAM */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        {isLoading ? (
          <div className="bg-white border border-[#E5D3B3]/60 rounded-3xl h-[400px] animate-pulse"></div>
        ) : featuredProgram ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="bg-white border border-[#E5D3B3]/60 rounded-3xl overflow-hidden shadow-xl flex flex-col lg:flex-row"
          >
            <div className="lg:w-1/2 h-[400px] lg:h-auto relative bg-[#E5D3B3]/20">
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url('${featuredProgram.image_urls?.[0] || ""}')` }} 
              />
            </div>
            
            <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
              <span className="inline-block bg-[#4A0E17]/10 text-[#4A0E17] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6 self-start">
                Featured Program
              </span>
              <h2 className={`${playfair.className} text-3xl md:text-4xl font-bold text-[#2B1B17] mb-4`}>
                {featuredProgram.title}
              </h2>
              <p className="text-[#2B1B17]/80 font-light leading-relaxed mb-8">
                {featuredProgram.description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                <button 
                  onClick={() => openModal(featuredProgram)}
                  className="inline-flex items-center justify-center gap-2 bg-transparent border border-[#4A0E17] text-[#4A0E17] hover:bg-[#4A0E17]/5 px-8 py-4 rounded-full text-sm font-medium uppercase tracking-widest transition-all w-full sm:w-auto"
                >
                  Lihat Detail
                </button>
                <a 
                  href={`https://wa.me/628155138385?text=${encodeURIComponent(`Halo Admin Arasa, saya tertarik untuk ikut program ${featuredProgram.title}. Boleh minta info lebih lanjut?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#2B1B17] text-[#FDFBF7] hover:bg-[#4A0E17] px-8 py-4 rounded-full text-sm font-medium uppercase tracking-widest transition-all shadow-lg w-full sm:w-auto"
                >
                  Reservasi <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-20 text-[#2B1B17]/50 font-light border border-dashed border-[#E5D3B3] rounded-3xl">
            Belum ada program yang tersedia saat ini.
          </div>
        )}
      </div>

      {/* OTHER PROGRAMS */}
      {otherPrograms.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#E5D3B3]/40 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h3 className={`${playfair.className} text-2xl md:text-3xl font-bold text-[#2B1B17] mb-2`}>
              Program Lainnya
            </h3>
            <p className="text-[#2B1B17]/60 font-light">Nantikan pengalaman istimewa lainnya dari kami.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {otherPrograms.map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
                className="group border border-[#E5D3B3]/60 rounded-2xl overflow-hidden bg-white hover:border-[#4A0E17] transition-colors cursor-pointer"
                onClick={() => openModal(program)}
              >
                <div className="h-48 relative bg-[#E5D3B3]/20 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-out grayscale group-hover:grayscale-0" 
                    style={{ backgroundImage: `url('${program.image_urls?.[0] || ""}')` }} 
                  />
                  <div className="absolute top-4 left-4 bg-[#FDFBF7]/90 backdrop-blur-sm text-[#2B1B17] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                    {program.status}
                  </div>
                </div>
                <div className="p-6 flex flex-col h-[160px]">
                  <h4 className={`${playfair.className} text-xl font-bold text-[#2B1B17] mb-2 line-clamp-1`}>{program.title}</h4>
                  <p className="text-sm text-[#2B1B17]/70 font-light leading-relaxed line-clamp-2">{program.description}</p>
                  
                  <div className="mt-auto pt-4 flex items-center text-xs font-bold uppercase tracking-widest text-[#4A0E17] group-hover:text-[#691224] transition-colors">
                    Lihat Detail <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DETAIL PROGRAM */}
      <AnimatePresence>
        {isModalOpen && selectedProgram && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#2B1B17]/70 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-3xl bg-[#FDFBF7] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur flex items-center justify-center rounded-full text-[#2B1B17] hover:bg-[#4A0E17] hover:text-white transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
              
              <div className="overflow-y-auto p-6 sm:p-10 [&::-webkit-scrollbar]:hidden">
                <h3 className={`${playfair.className} text-2xl sm:text-3xl font-bold text-[#2B1B17] mb-2`}>
                  {selectedProgram.title}
                </h3>
                <p className="text-[#2B1B17]/70 text-sm font-light mb-8">{selectedProgram.description}</p>
                
                <div className="space-y-6 text-[#2B1B17]/80 text-sm font-light leading-relaxed mb-10">
                  <div>
                    <h4 className="font-bold text-[#4A0E17] mb-3 uppercase tracking-widest text-xs">Persyaratan & Fasilitas</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {selectedProgram.requirements 
                        ? selectedProgram.requirements.split('\n').filter((req: string) => req.trim() !== '').map((req: string, idx: number) => (
                            <li key={idx}>{req}</li>
                          ))
                        : <li>Silakan hubungi admin untuk informasi lebih detail.</li>
                      }
                    </ul>
                  </div>
                </div>
                
                {selectedProgram.image_urls && selectedProgram.image_urls.length > 0 && (
                  <>
                    <h4 className="font-bold text-[#4A0E17] mb-4 uppercase tracking-widest text-xs">Galeri Program</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedProgram.image_urls.map((url: string, idx: number) => (
                        <div key={idx} className="aspect-square bg-[#E5D3B3]/30 rounded-xl overflow-hidden relative border border-[#E5D3B3]/40">
                           <div className="absolute inset-0 bg-cover bg-center hover:scale-110 transition-transform duration-500" style={{ backgroundImage: `url('${url}')` }} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              <div className="p-6 border-t border-[#E5D3B3]/40 bg-white shrink-0">
                <a 
                  href={`https://wa.me/628155138385?text=${encodeURIComponent(`Halo Admin Arasa, saya tertarik dengan program ${selectedProgram.title}. Boleh bantu proses reservasinya?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#4A0E17] text-[#FDFBF7] hover:bg-[#2B1B17] px-8 py-4 rounded-full text-sm font-medium uppercase tracking-widest transition-all shadow-md"
                >
                  Lanjut Reservasi via WhatsApp <ArrowRight size={16} />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}