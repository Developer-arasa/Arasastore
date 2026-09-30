import { MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#4A0E17] text-[#FDFBF7] py-16 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Brand & Social Media */}
        <div className="flex flex-col items-center mb-16 space-y-6">
          <div className="text-center">
            <h2 className="text-4xl font-serif font-bold tracking-widest mb-2 uppercase">Arasa Store</h2>
            <p className="text-sm text-[#E5D3B3] font-light tracking-wider">
              Premium Souvenirs at Bypass Mojokerto
            </p>
          </div>
          
          {/* Social Media Native SVG */}
          <div className="flex space-x-8">
            <a href="https://www.instagram.com/arasastore/" target="_blank" rel="noopener noreferrer" className="hover:text-[#E5D3B3] transition-transform hover:-translate-y-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://www.tiktok.com/@arasastore" target="_blank" rel="noopener noreferrer" className="hover:text-[#E5D3B3] transition-transform hover:-translate-y-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom Section: 3 Branch Locations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-t border-[#E5D3B3]/20 pt-12 pb-12">
          
          {/* Cabang 1 */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2 text-[#E5D3B3] font-bold tracking-widest uppercase mb-3 text-sm">
              <MapPin size={18} /> Arasa Store Pusat
            </div>
            <p className="text-sm text-[#FDFBF7]/80 font-light leading-relaxed max-w-xs">
              Jl. Raya By Pass No.km 50, Jokodayo, Mojokerto, Kec. Mojoanyar, Kota Mojokerto, Jawa Timur 61321
            </p>
          </div>

          {/* Cabang 2 */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2 text-[#E5D3B3] font-bold tracking-widest uppercase mb-3 text-sm">
              <MapPin size={18} /> Arasa Store Raden Wijaya
            </div>
            <p className="text-sm text-[#FDFBF7]/80 font-light leading-relaxed max-w-xs">
              Jl. Raden Wijaya No.5A, Gatul, Banjaragung, Kec. Puri, Kota Mojokerto, Jawa Timur 61321
            </p>
          </div>

          {/* Cabang 3 */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2 text-[#E5D3B3] font-bold tracking-widest uppercase mb-3 text-sm">
              <MapPin size={18} /> Arasa Store Stasiun
            </div>
            <p className="text-sm text-[#FDFBF7]/80 font-light leading-relaxed max-w-xs">
              Stasiun kereta api Mojokerto (ruang tunggu). Jl. Bhayangkara No.18, Mergelo, Miji, Kec. Prajurit Kulon, Kota Mojokerto, Jawa Timur 61322
            </p>
          </div>

        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-[#E5D3B3]/50 tracking-widest font-light">
          © 2026 Arasa Store Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
}