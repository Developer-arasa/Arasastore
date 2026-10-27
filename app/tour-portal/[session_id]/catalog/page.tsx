import { supabase } from "@/lib/supabase";
import TourCatalogClient from "./TourCatalogClient";

// refactored logic: instruksi ke Vercel untuk cache halaman ini selama 1 jam (3600 detik)
export const revalidate = 3600;

export default async function TourCatalogPage({ params }: { params: Promise<{ session_id: string }> }) {
  const { session_id } = await params;
  const { data: initialProducts } = await supabase
    .from('products')
    .select('*')
    .eq('tour_hide', false)
    .order('created_at', { ascending: true });

  return <TourCatalogClient sessionId={session_id} initialProducts={initialProducts || []} />;
}