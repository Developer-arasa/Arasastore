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
    if (!token) {
      router.replace("/tour-portal");
    } else {
      setIsAuthorized(true);
    }
  }, [router, pathname]);

  // Tahan render (Loading) sebelum dipastikan aman
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-[#E5D3B3] border-t-[#4A0E17] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f1e8] flex flex-col relative pb-20 sm:pb-0">
      <NavbarTL />
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {children}
      </div>
    </div>
  );
}