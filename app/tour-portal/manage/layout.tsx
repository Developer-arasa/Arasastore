import NavbarTL from "@/app/tour-portal/components/NavbarTL";

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col relative pb-20 sm:pb-0">
      <NavbarTL />
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {children}
      </div>
    </div>
  );
}