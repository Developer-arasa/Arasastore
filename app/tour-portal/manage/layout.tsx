"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import NavbarTL from "@/app/tour-portal/components/NavbarTL";

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Logic Gatekeeper (Satpam)
    const token = localStorage.getItem("tour_token");
    const isLoginPage = pathname?.includes("/login");

    if (!token && !isLoginPage) {
      router.push("/tour-portal/manage/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router, pathname]);

  // Tahan render (Loading) sebelum dipastikan aman
  if (!isAuthorized && !pathname?.includes("/login")) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-[#E5D3B3] border-t-[#4A0E17] rounded-full animate-spin"></div>
      </div>
    );
  }

  const isLoginPage = pathname?.includes("/login");

  // Return layout asli lu yang udah aman
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col relative pb-20 sm:pb-0">
      {/* Sembunyikan Navbar kalau lagi di halaman login */}
      {!isLoginPage && <NavbarTL />}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {children}
      </div>
    </div>
  );
}