"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X } from "lucide-react";
import { Playfair_Display } from "next/font/google";
import { useCartStore } from "@/store/useCartStore";
import CartDrawer from "./CartDrawer";

const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart } = useCartStore();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const totalItems = cart.reduce((total, item) => total + item.qty, 0);

  // Close menu saat route berubah (untuk client-side navigation)
  useEffect(() => {
    const handleRouteChange = () => setIsMenuOpen(false);
    window.addEventListener("routeChange", handleRouteChange);
    return () => window.removeEventListener("routeChange", handleRouteChange);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#FDFBF7] border-b border-[#E5D3B3]/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Logo - Always Visible */}
            <div className="flex-shrink-0">
              <Link href="/">
                <Image src="/logo.png" alt="Arasa Store" width={120} height={40} className="w-auto h-10 object-contain" priority />
              </Link>
            </div>

            {/* Desktop Navigation - Hidden on Mobile */}
            <nav className="hidden md:flex flex-1 items-center justify-center space-x-10">
              <Link href="/" className="text-sm uppercase tracking-widest text-[#2B1B17] hover:text-[#4A0E17] transition-colors font-medium py-2 relative group">
                Beranda
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#4A0E17] transition-all group-hover:w-full group-hover:left-0"></span>
              </Link>
              <Link href="/the-collection" className="text-sm uppercase tracking-widest text-[#2B1B17] hover:text-[#4A0E17] transition-colors font-medium py-2 relative group">
                The Collection
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#4A0E17] transition-all group-hover:w-full group-hover:left-0"></span>
              </Link>
              <Link href="/our-program" className="text-sm uppercase tracking-widest text-[#2B1B17] hover:text-[#4A0E17] transition-colors font-medium py-2 relative group">
                Program
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#4A0E17] transition-all group-hover:w-full group-hover:left-0"></span>
              </Link>
              <Link href="/career" className="text-sm uppercase tracking-widest text-[#2B1B17] hover:text-[#4A0E17] transition-colors font-medium py-2 relative group">
                Career
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#4A0E17] transition-all group-hover:w-full group-hover:left-0"></span>
              </Link>
              <Link href="/find-us" className="text-sm uppercase tracking-widest text-[#2B1B17] hover:text-[#4A0E17] transition-colors font-medium py-2 relative group">
                Contact
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#4A0E17] transition-all group-hover:w-full group-hover:left-0"></span>
              </Link>
            </nav>

            {/* Right Side Icons */}
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Menu */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-[#2B1B17] hover:text-[#4A0E17] transition-colors duration-200 rounded-lg hover:bg-[#E5D3B3]/20"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* Cart Icon */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-[#2B1B17] hover:text-[#4A0E17] transition-colors duration-200 rounded-lg hover:bg-[#E5D3B3]/20"
                aria-label="Shopping cart"
              >
                <ShoppingBag size={24} />
                {isMounted && totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-[#4A0E17] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#FDFBF7] animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Desktop CTA Button */}
              <div className="hidden md:block">
                <Link href="/find-us" className="bg-gradient-to-r from-[#4A0E17] to-[#691224] hover:from-[#691224] hover:to-[#8B1A32] text-[#FDFBF7] px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-xl hover:scale-105 duration-300">
                  Kunjungi Toko
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Full-Screen Overlay Menu */}
      <div 
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop Overlay */}
        <div 
          className="absolute inset-0 bg-[#2B1B17]/95 backdrop-blur-md transition-transform duration-300"
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu Content */}
        <div className={`relative z-10 w-full max-w-md ml-auto bg-[#FDFBF7] h-full shadow-2xl transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full p-6">
            {/* Header with Close Button */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E5D3B3]/40">
              <h2 className={`${playfair.className} text-2xl font-bold text-[#4A0E17]`}>Menu</h2>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-[#2B1B17] hover:text-[#4A0E17] transition-colors rounded-lg hover:bg-[#E5D3B3]/20"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto">
              <ul className="space-y-3">
                {[
                  { href: "/", label: "Beranda" },
                  { href: "/the-collection", label: "The Collection" },
                  { href: "/our-program", label: "Program" },
                  { href: "/career", label: "Career" },
                  { href: "/find-us", label: "Contact" }
                ].map((item) => (
                  <li key={item.href}>
                    <Link 
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-left px-4 py-3 text-base uppercase tracking-widest text-[#2B1B17] hover:bg-[#4A0E17] hover:text-[#FDFBF7] transition-all duration-300 rounded-lg font-medium shadow-sm hover:shadow-lg"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Bottom CTA */}
            <div className="pt-6 mt-6 border-t border-[#E5D3B3]/40">
              <Link 
                href="/find-us"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full bg-gradient-to-r from-[#4A0E17] to-[#691224] hover:from-[#691224] hover:to-[#8B1A32] text-[#FDFBF7] px-6 py-4 rounded-full text-center text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-xl"
              >
                Kunjungi Toko
              </Link>
            </div>
          </div>
        </div>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}