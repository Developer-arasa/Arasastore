"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function TourLoginPage() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPin, setShowPin] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // refactored logic: ganti pemanggilan select biasa dengan RPC dari Supabase
      const { data, error } = await supabase.rpc("verify_tour_leader_login", {
        p_username: username,
        p_pin: pin
      });

      if (error) {
        console.error(error);
        setErrorMessage("Layanan sedang mengalami gangguan. Coba lagi sebentar.");
        setLoading(false);
        return;
      }

      // RPC bakal balikin array kosong kalau username salah, nonaktif, atau PIN nggak match
      if (!data || data.length === 0) {
        setErrorMessage("Username atau PIN belum sesuai. Periksa kembali.");
        setLoading(false);
        return;
      }

      const userData = data[0];
      const agencyName = typeof userData.agency_name === "string"
        ? userData.agency_name.trim()
        : "";

      if (!userData.id || !userData.name || !agencyName) {
        localStorage.removeItem("tour_token");
        localStorage.removeItem("tour_name");
        localStorage.removeItem("tour_agency");
        setErrorMessage("Data travel agent belum lengkap. Hubungi administrator.");
        return;
      }

      localStorage.setItem("tour_token", userData.id);
      localStorage.setItem("tour_name", userData.name);
      localStorage.setItem("tour_agency", agencyName);
      
      router.push("/tour-portal/manage");
    } catch (err) {
      console.error(err);
      setErrorMessage("Koneksi gagal. Pastikan internet aktif lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f1e8] p-4 sm:p-6">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#b87954]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-[#4A0E17]/10 blur-3xl" />
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-[#eadbc9] bg-white/95 p-6 shadow-[0_24px_80px_-28px_rgba(74,14,23,.35)] sm:p-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#4A0E17] text-white"><Sparkles size={20} /></div>
          <div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#a96d4d]">Arasa Store</p><p className="text-xs text-[#2B1B17]/45">Partner workspace</p></div>
        </div>
        <div className="mb-8 text-left">
          <span className="inline-block text-[10px] uppercase tracking-[0.3em] text-[#4A0E17] font-bold mb-3 px-3 py-1 bg-[#4A0E17]/5 rounded-full">
            Arasa B2B Portal
          </span>
          <h1 className={`${playfair.className} text-3xl font-bold text-[#2B1B17] mb-2`}>
            Tour Leader
          </h1>
          <p className="text-sm leading-6 text-[#2B1B17]/60">
            Kelola rombongan dan pantau pesanan dengan lebih praktis.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#2B1B17] mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-5 py-3.5 rounded-xl border border-[#E5D3B3]/80 outline-none focus:border-[#4A0E17] focus:ring-1 focus:ring-[#4A0E17] transition-all bg-[#FDFBF7]/50"
              placeholder="Masukkan username..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#2B1B17] mb-2">
              PIN Keamanan
            </label>
            <input
              type={showPin ? "text" : "password"}
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              className="w-full rounded-2xl border border-[#eadbc9] bg-[#fcfaf7] px-5 py-3.5 pr-12 text-center text-lg tracking-[0.5em] outline-none transition focus:border-[#a96d4d] focus:ring-4 focus:ring-[#a96d4d]/10"
              placeholder="••••••"
            />
            <button type="button" onClick={() => setShowPin(!showPin)} className="absolute" aria-label="Tampilkan PIN">
              {showPin ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="group mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4A0E17] py-4 text-sm font-bold uppercase tracking-[.14em] text-white shadow-lg shadow-[#4A0E17]/20 transition hover:-translate-y-0.5 hover:bg-[#2B1B17] disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>Masuk Dashboard <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></>
            )}
          </button>
        </form>
        {errorMessage && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-center text-xs font-medium text-red-700">{errorMessage}</p>}
        <div className="mt-7 flex items-center justify-center gap-2 text-[11px] text-[#2B1B17]/45"><ShieldCheck size={14} /> Akses aman untuk partner Arasa</div>
      </div>
    </div>
  );
}