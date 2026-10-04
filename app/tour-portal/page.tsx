"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { supabase } from "@/lib/supabase";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function TourLoginPage() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("tour_leaders")
        .select("id, name, pin_hash")
        .eq("username", username)
        .eq("is_active", 1)
        .single();

      if (error || !data) {
        alert("Username tidak ditemukan atau akun dinonaktifkan.");
        setLoading(false);
        return;
      }

      if (data.pin_hash !== pin) {
        alert("PIN keamanan tidak valid.");
        setLoading(false);
        return;
      }

      localStorage.setItem("tour_token", data.id);
      localStorage.setItem("tour_name", data.name);
      
      router.push("/tour-portal/manage");
    } catch (err) {
      console.error(err);
      alert("Koneksi ke server gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-[#E5D3B3]/40">
        <div className="text-center mb-8">
          <span className="inline-block text-[10px] uppercase tracking-[0.3em] text-[#4A0E17] font-bold mb-3 px-3 py-1 bg-[#4A0E17]/5 rounded-full">
            Arasa B2B Portal
          </span>
          <h1 className={`${playfair.className} text-3xl font-bold text-[#2B1B17] mb-2`}>
            Tour Leader
          </h1>
          <p className="text-sm text-[#2B1B17]/60 font-light">
            Masuk untuk mengelola pesanan rombongan.
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
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              className="w-full px-5 py-3.5 rounded-xl border border-[#E5D3B3]/80 outline-none focus:border-[#4A0E17] focus:ring-1 focus:ring-[#4A0E17] transition-all text-center tracking-[0.5em] text-lg bg-[#FDFBF7]/50"
              placeholder="••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4A0E17] text-[#FDFBF7] py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#2B1B17] transition-all disabled:opacity-50 mt-4 shadow-lg shadow-[#4A0E17]/20 flex justify-center items-center"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              "Masuk Dashboard"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}