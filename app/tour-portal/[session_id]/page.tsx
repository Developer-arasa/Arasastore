"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { supabase } from "@/lib/supabase";
import { User, Bus, MapPin, AlertCircle } from "lucide-react";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function PassengerGatekeeperPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.session_id as string;

  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    busNumber: "",
    seatNumber: ""
  });

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase
          .from("tour_sessions")
          .select("group_name, status")
          .eq("id", sessionId)
          .single();

        if (error || !data || data.status !== "active") {
          setSessionData(null);
        } else {
          setSessionData(data);
          
          // auto-bypass logic jika user sudah pernah login di sesi ini
          const savedSession = localStorage.getItem("arasa_tour_session");
          if (savedSession === sessionId) {
            router.push(`/tour-portal/${sessionId}/catalog`);
          }
        }
      } catch (err) {
        console.error("Gagal verifikasi sesi:", err);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) fetchSession();
  }, [sessionId, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // save identifier to local storage
    localStorage.setItem("arasa_tour_session", sessionId);
    localStorage.setItem("arasa_passenger_name", formData.name);
    localStorage.setItem("arasa_bus_number", formData.busNumber);
    localStorage.setItem("arasa_seat_number", formData.seatNumber);

    router.push(`/tour-portal/${sessionId}/catalog`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-[#E5D3B3] border-t-[#4A0E17] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
        <div className="text-[#4A0E17] mb-4 bg-[#4A0E17]/10 p-4 rounded-full">
          <AlertCircle size={48} />
        </div>
        <h1 className={`${playfair.className} text-2xl font-bold text-[#2B1B17] mb-2 text-center`}>
          Sesi Tidak Valid
        </h1>
        <p className="text-[#2B1B17]/60 text-center max-w-sm">
          Link rombongan ini tidak ditemukan atau sesinya sudah diakhiri oleh Tour Leader.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col p-4 md:p-8">
      <div className="flex-1 flex flex-col max-w-md w-full mx-auto justify-center">
        <div className="text-center mb-8">
          <span className="inline-block text-[10px] uppercase tracking-[0.3em] text-[#4A0E17] font-bold mb-3 px-3 py-1 bg-[#4A0E17]/5 rounded-full">
            Arasa In-Bus Delivery
          </span>
          <h1 className={`${playfair.className} text-3xl font-bold text-[#2B1B17] mb-2`}>
            {sessionData.group_name}
          </h1>
          <p className="text-sm text-[#2B1B17]/60 font-light">
            Isi data diri Anda agar pesanan dapat diantar tepat ke kursi Anda.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-[#E5D3B3]/40">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#2B1B17]/70 mb-2">
                <User size={14} /> Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#E5D3B3] outline-none focus:border-[#4A0E17] bg-white text-sm"
                placeholder="Sesuai daftar absensi..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#2B1B17]/70 mb-2">
                  <Bus size={14} /> No. Bus
                </label>
                <input
                  type="text"
                  required
                  value={formData.busNumber}
                  onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5D3B3] outline-none focus:border-[#4A0E17] bg-white text-sm"
                  placeholder="Contoh: 1, 2, A"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#2B1B17]/70 mb-2">
                  <MapPin size={14} /> No. Kursi
                </label>
                <input
                  type="text"
                  required
                  value={formData.seatNumber}
                  onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5D3B3] outline-none focus:border-[#4A0E17] bg-white text-sm"
                  placeholder="Contoh: 4B, 12"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 bg-[#4A0E17] text-[#FDFBF7] py-3.5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#2B1B17] transition-all shadow-md flex justify-center items-center disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                "Mulai Belanja"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}