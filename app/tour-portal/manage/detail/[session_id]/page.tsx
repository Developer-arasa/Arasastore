"use client"; 

import { useState, useEffect, useMemo } from "react"; 
import { useParams, useRouter } from "next/navigation"; 
import { Playfair_Display } from "next/font/google"; 
import { supabase } from "@/lib/supabase"; 
import {    
  ArrowLeft, Copy, RefreshCw, CheckCircle2,    
  Users, ShoppingBag, Send, User, ChevronRight,
  Search, X, Trash2, Edit2, Plus, Minus, Save
} from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";

const playfair = Playfair_Display({ subsets: ["latin"] }); 

export default function SessionDetailPage() {   
  const params = useParams();   
  const router = useRouter();   
  const sessionId = params.session_id as string;   
  
  const [session, setSession] = useState<any>(null);   
  const [orders, setOrders] = useState<any[]>([]);   
  const [allProducts, setAllProducts] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);   
  const [refreshing, setRefreshing] = useState(false);   
  const [isCopied, setIsCopied] = useState(false);   
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editableItems, setEditableItems] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {     
    if (sessionId) fetchSessionData();   
  }, [sessionId]);   

  const fetchSessionData = async () => {     
    try {       
      const { data: sessionData, error: sessionError } = await supabase         
        .from("tour_sessions")         
        .select("*")         
        .eq("id", sessionId)         
        .single();       
      if (sessionError) throw sessionError;       
      setSession(sessionData);       
      
      const { data: ordersData, error: ordersError } = await supabase         
        .from("tour_orders")         
        .select(`           
          *,           
          tour_order_items (             
            product_id,
            qty,             
            price_at_checkout,
            products (
              name,
              image_url
            )
          )         
        `)         
        .eq("session_id", sessionId)         
        .order("created_at", { ascending: false });       
      if (ordersError) throw ordersError;       
      setOrders(ordersData || []);     

      const { data: prodData } = await supabase.from('products').select('*');
      if (prodData) setAllProducts(prodData);

    } catch (err) {       
      console.error("Gagal menarik detail sesi:", err);       
    } finally {       
      setLoading(false);       
      setRefreshing(false);     
    }   
  };   

  const metrics = useMemo(() => {     
    let passengers = orders.length;     
    let items = 0;     
    let revenue = 0;     
    orders.forEach(order => {       
      order.tour_order_items?.forEach((item: any) => {         
        items += item.qty;         
        revenue += (item.qty * item.price_at_checkout);       
      });     
    });     
    return { totalPassengers: passengers, totalItems: items, totalRevenue: revenue };   
  }, [orders]);   

  const handleRefresh = () => {     
    setRefreshing(true);     
    fetchSessionData();   
  };   

  const copyMagicLink = () => {     
    const magicLink = `${window.location.origin}/tour-portal/${sessionId}`;     
    navigator.clipboard.writeText(magicLink);     
    setIsCopied(true);     
    setTimeout(() => setIsCopied(false), 3000);   
  };   

  const finalizeOrder = async () => {     
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('tour_sessions')
        .update({ status: 'locked' })
        .eq('id', sessionId);

      if (error) throw error;

      const text = `Halo Admin Arasa,%0A%0ASaya ingin konfirmasi pesanan rombongan B2B:%0A*Nama Rombongan:* ${session?.group_name || 'Rombongan'}%0A*ID Sesi:* ${sessionId.substring(0,8)}%0A*Estimasi Tiba (ETA):* ${session?.eta}%0A%0A*Total Penumpang:* ${metrics.totalPassengers} orang%0A*Total Produk:* ${metrics.totalItems} item%0A*Estimasi Tagihan:* Rp ${metrics.totalRevenue.toLocaleString('id-ID')}%0A%0AMohon disiapkan. Terima kasih!`;     
      const waUrl = `https://wa.me/628155138385?text=${text}`;      
      window.open(waUrl, '_blank');   
      
      fetchSessionData();
    } catch (error) {
      console.error("Gagal mengunci sesi:", error);
      alert("Gagal mengunci pesanan.");
    } finally {
      setIsSaving(false);
    }
  };   

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = (order.passenger_name || "").toLowerCase().includes(searchLower);
    const seatMatch = (order.seat_number || "").toLowerCase().includes(searchLower);
    return nameMatch || seatMatch;
  });

  const openModal = (order: any) => {
    setSelectedOrder(order);
    setIsEditMode(false);
    setEditableItems(order.tour_order_items ? [...order.tour_order_items] : []);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setIsEditMode(false);
    setEditableItems([]);
  };

  const handleDeleteOrder = async () => {
    if (!confirm(`Yakin ingin menghapus seluruh pesanan atas nama ${selectedOrder.passenger_name}?`)) return;
    setIsSaving(true);
    try {
      await supabase.from('tour_order_items').delete().eq('tour_order_id', selectedOrder.id);
      await supabase.from('tour_orders').delete().eq('id', selectedOrder.id);
      fetchSessionData();
      closeModal();
    } catch (error) {
      console.error("Gagal hapus", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateQty = (productId: string, delta: number) => {
    setEditableItems(prev => prev.map(item => {
      if (item.product_id === productId) {
        return { ...item, qty: item.qty + delta };
      }
      return item;
    }).filter(item => item.qty > 0)); 
  };

  const handleAddNewItem = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    const product = allProducts.find(p => p.id === selectedId);
    if (!product) return;

    const exists = editableItems.find(i => i.product_id === selectedId);
    if (exists) {
      updateQty(selectedId, 1);
    } else {
      setEditableItems([...editableItems, {
        product_id: product.id,
        qty: 1,
        price_at_checkout: product.price,
        products: { name: product.name, image_url: product.image_url }
      }]);
    }
    e.target.value = ""; 
  };

  const handleSaveChanges = async () => {
    if (editableItems.length === 0) {
      handleDeleteOrder();
      return;
    }
    setIsSaving(true);
    try {
      await supabase.from('tour_order_items').delete().eq('tour_order_id', selectedOrder.id);
      const payload = editableItems.map(item => ({
        tour_order_id: selectedOrder.id,
        product_id: item.product_id,
        qty: item.qty,
        price_at_checkout: item.price_at_checkout
      }));
      await supabase.from('tour_order_items').insert(payload);
      fetchSessionData();
      closeModal();
    } catch (error) {
      console.error("Gagal simpan", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {     
    return (       
      <div className="w-full flex justify-center items-center py-20">         
        <div className="w-8 h-8 border-4 border-[#E5D3B3] border-t-[#4A0E17] rounded-full animate-spin"></div>       
      </div>     
    );   
  }

  return (     
    <div className="w-full max-w-4xl mx-auto pb-10">       
      <div className="flex items-center gap-4 mb-8">         
        <button            
          onClick={() => router.push('/tour-portal/manage')}           
          className="p-2.5 bg-white border border-[#E5D3B3] rounded-full text-[#2B1B17] hover:bg-[#FDFBF7] transition-all shadow-sm"         
        >           
          <ArrowLeft size={20} />         
        </button>         
        <div>           
          <h1 className={`${playfair.className} text-2xl sm:text-3xl font-bold text-[#2B1B17]`}>             
            {session?.group_name || "Detail Rombongan"}           
          </h1>           
          <div className="flex items-center gap-3 text-xs text-[#2B1B17]/60 font-medium mt-1">             
            <span className={`uppercase tracking-widest px-2 py-0.5 rounded ${session?.status === 'active' ? 'bg-[#00AA5B]/10 text-[#00AA5B]' : 'bg-[#2B1B17]/10 text-[#2B1B17]/60'}`}>
              {session?.status === 'active' ? 'Aktif' : 'Selesai'}
            </span>
            <span className="w-1 h-1 bg-[#E5D3B3] rounded-full"></span>             
            <span>ETA: {session?.eta}</span>           
          </div>         
        </div>       
      </div>       

      {/* CONDITIONAL RENDER: Magic Link / Banner Selesai */}
      {session?.status === 'active' ? (
        <div className="bg-white border border-[#E5D3B3]/60 rounded-3xl p-5 sm:p-6 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">         
          <div>           
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#2B1B17] mb-1">             
              Copy Link sesi          
            </h2>           
            <p className="text-xs text-[#2B1B17]/60 font-light">             
              Bagikan link ini ke grup WhatsApp agar rombongan bisa memesan mandiri.           
            </p>         
          </div>         
          <button            
            onClick={copyMagicLink}           
            className={`flex-shrink-0 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all shadow-md ${             
              isCopied ? 'bg-[#00AA5B] text-white border-transparent' : 'bg-[#4A0E17] text-[#FDFBF7] hover:bg-[#2B1B17]'           
            }`}         
          >           
            {isCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}           
            {isCopied ? "Link Tersalin!" : "Salin Link"}         
          </button>       
        </div>
      ) : (
        <div className="bg-[#00AA5B]/10 border border-[#00AA5B]/30 rounded-3xl p-5 sm:p-6 mb-6 flex flex-col items-center justify-center text-center shadow-sm">
          <CheckCircle2 size={24} className="text-[#00AA5B] mb-2" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#00AA5B] mb-1">Pesanan Telah Selesai</h2>
          <p className="text-xs text-[#2B1B17]/70 font-light leading-relaxed max-w-md">
            Sesi pemesanan telah dikunci. Kami tunggu kedatangannya di <strong className="font-bold">Arasa Store, Mojokerto</strong>.
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">         
        <div className="bg-white border border-[#E5D3B3]/60 p-4 rounded-2xl flex flex-col items-center justify-center text-center">           
          <Users size={20} className="text-[#E5D3B3] mb-2" />           
          <p className="text-2xl font-bold text-[#2B1B17]">{metrics.totalPassengers}</p>           
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#2B1B17]/50 mt-1">Penumpang</span>         
        </div>         
        <div className="bg-white border border-[#E5D3B3]/60 p-4 rounded-2xl flex flex-col items-center justify-center text-center">           
          <ShoppingBag size={20} className="text-[#E5D3B3] mb-2" />           
          <p className="text-2xl font-bold text-[#2B1B17]">{metrics.totalItems}</p>           
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#2B1B17]/50 mt-1">Total Item</span>         
        </div>         
        <div className="bg-gradient-to-br from-[#4A0E17] to-[#691224] p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-md">           
          <p className="text-lg sm:text-xl font-bold text-[#FDFBF7] mt-2 mb-1">             
            {new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(metrics.totalRevenue)}           
          </p>           
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#FDFBF7]/70">Est. Tagihan</span>         
        </div>       
      </div>       

      <div className="bg-white border border-[#E5D3B3]/60 rounded-3xl overflow-hidden shadow-sm">         
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 border-b border-[#E5D3B3]/40 bg-[#FDFBF7]/30 gap-4">           
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#2B1B17]">             
            Daftar Pesanan Masuk           
          </h2>           
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Cari nama atau kursi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-[#E5D3B3] outline-none focus:border-[#4A0E17] bg-white transition-colors"
              />
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2B1B17]/40" />
            </div>
            <button              
              onClick={handleRefresh}             
              disabled={refreshing}             
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#4A0E17] hover:bg-[#4A0E17]/10 px-3 py-2 rounded-full transition-all disabled:opacity-50 shrink-0"           
            >             
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />             
              <span className="hidden sm:block">{refreshing ? 'Memuat...' : 'Refresh'}</span>
            </button>         
          </div>
        </div>         

        <div className="divide-y divide-[#E5D3B3]/30">           
          {filteredOrders.length === 0 ? (             
            <div className="p-10 text-center flex flex-col items-center">               
              <ShoppingBag size={32} className="text-[#E5D3B3] mb-3" />               
              <p className="text-sm text-[#2B1B17]/60 font-light">Belum ada pesanan yang sesuai.</p>             
            </div>           
          ) : (             
            filteredOrders.map((order) => {               
              let totalQty = 0;               
              let totalPrice = 0;               
              order.tour_order_items?.forEach((item: any) => {                 
                totalQty += item.qty;                 
                totalPrice += (item.qty * item.price_at_checkout);               
              });               
              return (                 
                <button 
                  key={order.id} 
                  onClick={() => openModal(order)}
                  className="w-full p-4 sm:p-5 hover:bg-[#FDFBF7] transition-colors flex items-center justify-between group cursor-pointer text-left"
                >                   
                  <div className="flex items-center gap-4">                     
                    <div className="w-10 h-10 rounded-full bg-[#E5D3B3]/20 flex items-center justify-center flex-shrink-0 text-[#4A0E17]">                       
                      <User size={18} />                     
                    </div>                     
                    <div>                       
                      <h3 className="text-sm font-bold text-[#2B1B17]">{order.passenger_name}</h3>                       
                      <p className="text-[10px] uppercase tracking-widest text-[#2B1B17]/50 mt-0.5">                         
                        Kursi: <span className="font-bold text-[#2B1B17]/80">{order.seat_number || '-'}</span>                       
                      </p>                     
                    </div>                   
                  </div>                   
                  <div className="text-right flex items-center gap-3">                     
                    <div className="text-right">                       
                      <p className="text-xs font-bold text-[#4A0E17]">Rp {totalPrice.toLocaleString('id-ID')}</p>                       
                      <p className="text-[10px] text-[#2B1B17]/50">{totalQty} item</p>                     
                    </div>                     
                    <div className="hidden sm:block p-2 text-[#E5D3B3] group-hover:text-[#4A0E17] transition-colors">                       
                      <ChevronRight size={18} />                     
                    </div>                   
                  </div>                 
                </button>               
              );             
            })           
          )}         
        </div>       
      </div>       

      <div className="mt-8 flex justify-end">         
        <button            
          onClick={finalizeOrder}           
          disabled={isSaving}
          className="flex items-center gap-2 bg-[#00AA5B] text-white px-6 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#008c4b] transition-all shadow-lg disabled:opacity-50"         
        >           
          <Send size={18} />           
          Kirim ke WA Admin         
        </button>       
      </div>     

      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1B17]/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#E5D3B3]/40">
                <div>
                  <h2 className={`${playfair.className} text-xl font-bold text-[#2B1B17]`}>{selectedOrder.passenger_name}</h2>
                  <p className="text-[10px] uppercase tracking-widest text-[#2B1B17]/50 mt-1">Kursi: {selectedOrder.seat_number || '-'}</p>
                </div>
                <button 
                  onClick={closeModal}
                  disabled={isSaving}
                  className="p-2 text-[#2B1B17]/40 hover:text-[#4A0E17] transition-colors bg-[#FDFBF7] rounded-full border border-[#E5D3B3]/40 disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-[#FDFBF7]/30">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#2B1B17]/50 border-b border-[#E5D3B3]/30 pb-2">
                  {isEditMode ? "Edit Barang" : "Rincian Barang"}
                </h3>
                
                <div className="space-y-4">
                  {(isEditMode ? editableItems : selectedOrder.tour_order_items)?.map((item: any, i: number) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex-1 flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-[#2B1B17]">{item.products?.name || "Produk dihapus"}</h4>
                        
                        {!isEditMode ? (
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-[10px] text-[#2B1B17]/60 font-medium">{item.qty} x {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price_at_checkout)}</p>
                            <p className="text-xs font-bold text-[#4A0E17]">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.qty * item.price_at_checkout)}</p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs font-bold text-[#4A0E17]">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price_at_checkout)}</p>
                            <div className="flex items-center bg-white border border-[#E5D3B3] rounded-full overflow-hidden">
                              <button onClick={() => updateQty(item.product_id, -1)} className="w-7 h-7 flex items-center justify-center text-[#2B1B17] hover:bg-[#4A0E17]/5 transition-colors">
                                <Minus size={12} />
                              </button>
                              <span className="w-8 text-center text-xs font-bold text-[#2B1B17]">{item.qty}</span>
                              <button onClick={() => updateQty(item.product_id, 1)} className="w-7 h-7 flex items-center justify-center text-[#2B1B17] hover:bg-[#4A0E17]/5 transition-colors">
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isEditMode && (
                    <div className="pt-3 border-t border-[#E5D3B3]/40 mt-3">
                      <select 
                        onChange={handleAddNewItem}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5D3B3] bg-white outline-none focus:border-[#4A0E17] text-[#2B1B17]"
                      >
                        <option value="">+ Tambah Produk Baru...</option>
                        {allProducts.map(p => (
                          <option key={p.id} value={p.id}>{p.name} - Rp {p.price.toLocaleString('id-ID')}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 sm:p-6 bg-white border-t border-[#E5D3B3]/40">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[10px] uppercase tracking-widest text-[#2B1B17]/50 font-bold">Total Tagihan</span>
                  <span className="text-lg font-bold text-[#4A0E17]">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
                      (isEditMode ? editableItems : selectedOrder.tour_order_items)?.reduce((sum: number, item: any) => sum + (item.qty * item.price_at_checkout), 0) || 0
                    )}
                  </span>
                </div>

                {/* CONDITIONAL RENDER: Hapus tombol edit kalau sesi Selesai */}
                {session?.status === 'active' && (
                  !isEditMode ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setIsEditMode(true)} className="flex items-center justify-center gap-2 border border-[#E5D3B3] text-[#2B1B17] py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#FDFBF7] transition-all">
                        <Edit2 size={14} /> Edit
                      </button>
                      <button onClick={handleDeleteOrder} disabled={isSaving} className="flex items-center justify-center gap-2 bg-[#4A0E17]/10 text-[#4A0E17] py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#4A0E17]/20 transition-all disabled:opacity-50">
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => { setIsEditMode(false); setEditableItems(selectedOrder.tour_order_items ? [...selectedOrder.tour_order_items] : []); }} disabled={isSaving} className="flex items-center justify-center gap-2 border border-[#E5D3B3] text-[#2B1B17] py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#FDFBF7] transition-all disabled:opacity-50">
                        Batal
                      </button>
                      <button onClick={handleSaveChanges} disabled={isSaving} className="flex items-center justify-center gap-2 bg-[#00AA5B] text-white py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#008c4b] transition-all disabled:opacity-50 shadow-md">
                        {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <><Save size={14} /> Simpan</>}
                      </button>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>   
  ); 
}