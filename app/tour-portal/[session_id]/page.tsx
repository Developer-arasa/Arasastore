"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, ArrowRight, User, Bus, MapPin } from "lucide-react";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function PassengerEntryPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.session_id as string;

  const [sessionStatus, setSessionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [name, setName] = useState("");
  const [bus, setBus] = useState("");
  const [seat, setSeat] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const initPage = async () => {
      // 1. Cek apakah udah pernah sukses checkout
      const isDone = localStorage.getItem(`arasa_order_done_${sessionId}`);
      if (isDone) {
        router.push(`/tour-portal/${sessionId}/success`);
        return;
      }

      // 2. Fetch status sesi dari database
      try {
        const { data } = await supabase
          .from("tour_sessions")
          .select("status")
          .eq("id", sessionId)
          .single();
          
        if (data) setSessionStatus(data.status);
      } catch (error) {
        console.error("Gagal cek status:", error);
      } finally {
        setLoading(false);
      }

      // 3. Auto-fill kalau sebelumnya udah pernah ngisi form
      const savedName = localStorage.getItem("arasa_passenger_name");
      const savedBus = localStorage.getItem("arasa_bus_number");
      const savedSeat = localStorage.getItem("arasa_seat_number");
      if (savedName) setName(savedName);
      if (savedBus) setBus(savedBus);
      if (savedSeat) setSeat(savedSeat);
    };

    if (sessionId) initPage();
  }, [sessionId, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !bus.trim() || !seat.trim()) {
      setFormError("Lengkapi nama, nomor bus, dan nomor kursi terlebih dahulu.");
      return;
    }
    
    localStorage.setItem("arasa_passenger_name", name);
    localStorage.setItem("arasa_bus_number", bus);
    localStorage.setItem("arasa_seat_number", seat);
    localStorage.setItem("arasa_tour_session", sessionId);
    
    router.push(`/tour-portal/${sessionId}/catalog`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-[#E5D3B3] border-t-[#4A0E17] rounded-full animate-spin"></div>
      </div>
    );
  }

  // LOGIC GATEKEEPER: Tampilkan closing banner jika sesi bukan 'active'
  if (sessionStatus && sessionStatus !== 'active') {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#E5D3B3]/60 mb-6">
          <CheckCircle2 size={40} className="text-[#00AA5B]" />
        </div>
        <h1 className={`${playfair.className} text-2xl font-bold text-[#4A0E17] mb-3`}>
          Pesanan Selesai
        </h1>
        <p className="text-sm text-[#2B1B17]/70 font-light leading-relaxed max-w-xs mx-auto">
          Sesi pemesanan untuk rombongan ini telah ditutup oleh Tour Leader. Kami tunggu kedatangannya di <strong className="font-bold text-[#4A0E17]">Arasa Store, Mojokerto</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f1e8] flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-[0_24px_80px_-32px_rgba(74,14,23,.4)] border border-[#eadbc9] overflow-hidden">
        <div className="bg-[#4A0E17] p-7 sm:p-9 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <h1 className={`${playfair.className} text-2xl font-bold text-[#FDFBF7] relative z-10`}>
            Arasa In-Bus Delivery
          </h1>
          <p className="text-sm text-[#FDFBF7]/70 mt-2 relative z-10">Siapkan pesananmu, kami antar langsung ke bus.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#2B1B17]/50 block mb-2">Nama Lengkap</label>
            <div className="relative">
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Bayu Agus"
                 className="w-full rounded-2xl border border-[#eadbc9] bg-[#fcfaf7] py-3.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#a96d4d] focus:ring-4 focus:ring-[#a96d4d]/10"
                required
              />
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2B1B17]/40" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#2B1B17]/50 block mb-2">Nomor Bus</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={bus}
                  onChange={(e) => setBus(e.target.value)}
                  placeholder="Contoh: 1"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5D3B3] outline-none focus:border-[#4A0E17] text-sm text-[#2B1B17] bg-[#FDFBF7]/50"
                  required
                />
                <Bus size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2B1B17]/40" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#2B1B17]/50 block mb-2">Nomor Kursi</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={seat}
                  onChange={(e) => setSeat(e.target.value)}
                  placeholder="Contoh: 23"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E5D3B3] outline-none focus:border-[#4A0E17] text-sm text-[#2B1B17] bg-[#FDFBF7]/50"
                  required
                />
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2B1B17]/40" />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[#4A0E17] text-[#FDFBF7] py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#2B1B17] transition-all mt-4 shadow-md hover:-translate-y-0.5"
          >
            Mulai Belanja <ArrowRight size={16} />
          </button>
        </form>
        {formError && <p role="alert" className="px-6 pb-6 text-center text-xs font-medium text-red-700">{formError}</p>}
      </div>
    </div>
  );
}