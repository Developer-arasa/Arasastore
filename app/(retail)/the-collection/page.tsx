import { supabase } from "@/lib/supabase";
import CollectionClient from "./CollectionClient";

// refactored logic: instruksi ke Vercel untuk cache halaman ini selama 1 jam (3600 detik)
export const revalidate = 3600;

export default async function TheCollectionPage() {
  const { data: initialProducts } = await supabase
    .from('products')
    .select('*')
    .eq('hide', false)
    .order('created_at', { ascending: true });

  return <CollectionClient initialProducts={initialProducts || []} />;
}