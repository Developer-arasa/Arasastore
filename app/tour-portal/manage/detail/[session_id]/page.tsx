"use client"; 

import { useState, useEffect, useMemo } from "react"; 
import { useParams, useRouter } from "next/navigation"; 
import { Playfair_Display } from "next/font/google"; 
import { supabase } from "@/lib/supabase"; 
import {    
  ArrowLeft, Copy, RefreshCw, CheckCircle2,    
  Users, ShoppingBag, Send, User, ChevronRight,
  Search, X, Trash2, Edit2, Plus, Minus, Save, UserPlus, Bus, MapPin, Table, UserCheck
} from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";

const playfair = Playfair_Display({ subsets: ["latin"] }); 
const BUS_NUMBERS = Array.from({ length: 15 }, (_, i) => (i + 1).toString());

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

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPassengerName, setNewPassengerName] = useState("");
  const [newBusNumber, setNewBusNumber] = useState("1");
  const [newSeatNumber, setNewSeatNumber] = useState("");
  const [newOrderItems, setNewOrderItems] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<"detail" | "matriks_flip" | "matriks_scroll">("detail");

  const [matrixData, setMatrixData] = useState<{
    productColumns: string[];
    processedOrders: any[];
    totals: Record<string, number>;
  }>({ productColumns: [], processedOrders: [], totals: {} });


  useEffect(() => {     
    if (sessionId) fetchSessionData();   
  }, [sessionId]);   

  const fetchSessionData = async () => {     
    try {       
      const token = localStorage.getItem("tour_token");
      if (!token) {
        router.replace("/tour-portal");
        return;
      }

      const { data: sessionData, error: sessionError } = await supabase         
        .from("tour_sessions")         
        .select("*")         
        .eq("id", sessionId)         
        .eq("tl_id", token)         
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

      if (ordersData) {
         const itemAggregator: Record<string, number> = {};
         const processedOrders = ordersData.map((order: any) => {
           let orderTotal = 0;
           const itemMap: Record<string, number> = {};

           order.tour_order_items?.forEach((item: any) => {
              if(item.qty > 0) {
                 const name = item.products?.name || "Produk dihapus";
                 itemAggregator[name] = (itemAggregator[name] || 0) + item.qty;
                 itemMap[name] = (itemMap[name] || 0) + item.qty;
                 orderTotal += (item.qty * item.price_at_checkout);
              }
           });
           return { ...order, itemMap, orderTotal };
         });
         
         const productColumns = Object.keys(itemAggregator).sort();
         setMatrixData({ productColumns, processedOrders, totals: itemAggregator });
      }

      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .eq('tour_hide', false)
        .order('name', { ascending: true });
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

      const agencyName = localStorage.getItem("tour_agency") || "Tidak tersedia";
      const text = `Halo Admin Arasa,%0A%0ASaya ingin konfirmasi pesanan rombongan B2B:%0A*Nama Biro:* ${agencyName}%0A*Nama Rombongan:* ${session?.group_name || 'Rombongan'}%0A*ID Sesi:* ${sessionId.substring(0,8)}%0A%0A*Total Penumpang:* ${metrics.totalPassengers} orang%0A*Total Produk:* ${metrics.totalItems} item%0A%0AMohon disiapkan. Terima kasih!`;     
      const waUrl = `https://wa.me/628155138385?text=${text}`;      
      window.open(waUrl, '_blank');

      // Kirim rekap pesanan (group by produk) ke grup WhatsApp via Fonnte
      const productsText = matrixData.productColumns
        .map((name) => `• ${name}: ${matrixData.totals[name]} item`)
        .join("\n");

      fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "finalize_order",
          agency: agencyName,
          groupName: session?.group_name || "Rombongan",
          sessionId,
          totalPassengers: metrics.totalPassengers,
          productsText,
        }),
      }).catch(() => {});
      
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

  const openCreateModal = () => {
    setNewPassengerName("");
    setNewBusNumber("1");
    setNewSeatNumber("");
    setNewOrderItems([]);
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (isSaving) return;
    setIsCreateModalOpen(false);
  };

  const updateNewItemQty = (productId: string, delta: number) => {
    setNewOrderItems(prev => prev.map(item => {
      if (item.product_id === productId) {
        return { ...item, qty: item.qty + delta };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const handleSelectProductForNewOrder = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    const product = allProducts.find(p => p.id === selectedId);
    if (!product) return;

    const exists = newOrderItems.find(i => i.product_id === selectedId);
    if (exists) {
      updateNewItemQty(selectedId, 1);
    } else {
      setNewOrderItems(prev => [...prev, {
        product_id: product.id,
        qty: 1,
        price_at_checkout: product.price,
        products: { name: product.name, image_url: product.image_url }
      }]);
    }
    e.target.value = "";
  };

  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassengerName.trim() || !newSeatNumber.trim()) {
      alert("Nama penumpang dan nomor kursi wajib diisi.");
      return;
    }
    if (newOrderItems.length === 0) {
      alert("Pilih minimal 1 produk untuk dipesan.");
      return;
    }

    setIsSaving(true);
    try {
      const { data: orderData, error: orderError } = await supabase
        .from("tour_orders")
        .insert([{
          session_id: sessionId,
          passenger_name: newPassengerName.trim(),
          bus_number: newBusNumber,
          seat_number: newSeatNumber.trim(),
          status: "confirmed"
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      const itemsPayload = newOrderItems.map(item => ({
        tour_order_id: orderData.id,
        product_id: item.product_id,
        qty: item.qty,
        price_at_checkout: item.price_at_checkout
      }));

      const { error: itemsError } = await supabase
        .from("tour_order_items")
        .insert(itemsPayload);

      if (itemsError) throw itemsError;

      await fetchSessionData();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Gagal membuat pesanan baru:", error);
      alert("Gagal menyimpan pesanan. Pastikan koneksi aman.");
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
    <div className="w-full max-w-6xl mx-auto pb-10 px-4 sm:px-6">       
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
            className={`shrink-0 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all shadow-md ${             
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">         
        <div className="bg-white border border-[#E5D3B3]/60 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">           
          <Users size={20} className="text-[#E5D3B3] mb-2" />           
          <p className="text-2xl font-bold text-[#2B1B17]">{metrics.totalPassengers}</p>           
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#2B1B17]/50 mt-1">Penumpang</span>         
        </div>         
        <div className="bg-white border border-[#E5D3B3]/60 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">           
          <ShoppingBag size={20} className="text-[#E5D3B3] mb-2" />           
          <p className="text-2xl font-bold text-[#2B1B17]">{metrics.totalItems}</p>           
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#2B1B17]/50 mt-1">Total Item</span>         
        </div>         
        <div className="bg-[#4A0E17] p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-md">           
          <p className="text-xl font-bold text-[#FDFBF7] mt-2 mb-1">             
            {new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(metrics.totalRevenue)}           
          </p>           
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#FDFBF7]/70">Est. Belanja</span>         
        </div>       
      </div>       



      {/* ==================== NAVIGASI 3 SUB-TAB (A/B TESTING) ==================== */}
     {/* ==================== NAVIGASI 3 SUB-TAB (A/B TESTING) ==================== */}
      <div className="flex overflow-x-auto gap-2 mb-6 border-b border-[#E5D3B3]/40 pb-4 w-full" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => setActiveTab("detail")}
          className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
            activeTab === "detail" ? "bg-[#4A0E17] text-[#FDFBF7] shadow-sm" : "bg-white text-[#2B1B17]/60 border border-[#E5D3B3] hover:text-[#4A0E17]"
          }`}
        >
          <UserCheck size={15} /> Daftar Pesanan
        </button>
        <button
          onClick={() => setActiveTab("matriks_flip")}
          className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
            activeTab === "matriks_flip" ? "bg-[#4A0E17] text-[#FDFBF7] shadow-sm" : "bg-white text-[#2B1B17]/60 border border-[#E5D3B3] hover:text-[#4A0E17]"
          }`}
        >
          <Table size={15} /> Rekap (card)
        </button>
        <button
          onClick={() => setActiveTab("matriks_scroll")}
          className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
            activeTab === "matriks_scroll" ? "bg-[#4A0E17] text-[#FDFBF7] shadow-sm" : "bg-white text-[#2B1B17]/60 border border-[#E5D3B3] hover:text-[#4A0E17]"
          }`}
        >
          <Table size={15} /> Rekap (Scroll)
        </button>
      </div>

      {/* ==================== TAB: MATRIKS OPSI 2 (RESPONSIVE FLIP / CARD) ==================== */}
      {activeTab === "matriks_flip" && (
        <div className="bg-white border border-[#E5D3B3]/60 rounded-3xl overflow-hidden shadow-sm mb-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 border-b border-[#E5D3B3]/40 bg-[#FDFBF7]/30 gap-4">           
            <div className="flex items-center gap-2">
              <Table size={18} className="text-[#4A0E17]" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#2B1B17]">             
                Matriks Pesanan (Card)
              </h2>           
            </div>
            <span className="w-fit self-start sm:self-auto text-[10px] font-bold uppercase tracking-widest bg-[#00AA5B]/10 text-[#00AA5B] px-3 py-1.5 rounded-full shrink-0">
               {matrixData.processedOrders.length} Penumpang
            </span>
          </div>
          
          {matrixData.processedOrders.length === 0 ? (
             <p className="text-center text-sm text-[#2B1B17]/40 italic py-12">Belum ada pesanan masuk.</p>
          ) : (
            <>
              {/* VERSI MOBILE (CARD LIST BERISI BADGE) */}
              <div className="block sm:hidden p-4 space-y-4 bg-[#FAFAFA]">
                {matrixData.processedOrders.map((order, idx) => (
                  <div key={order.id} className="bg-white border border-[#E5D3B3]/60 rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3 border-b border-[#E5D3B3]/30 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-[#2B1B17]">{idx + 1}. {order.passenger_name}</h3>
                        <p className="text-[10px] text-[#2B1B17]/50 uppercase tracking-widest mt-0.5">
                          Bus {order.bus_number || '1'} • Kursi {order.seat_number || '-'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#4A0E17]">Rp {order.orderTotal.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {matrixData.productColumns.map((colName) => {
                        const qty = order.itemMap?.[colName];
                        if (!qty) return null; 
                        return (
                          <span key={colName} className="inline-flex items-center gap-1.5 bg-[#FDFBF7] border border-[#E5D3B3]/60 text-[#2B1B17] px-2.5 py-1.5 rounded-lg text-[10px] font-semibold">
                            <span className="text-[#2B1B17]/70 truncate max-w-30">{colName}</span>
                            <span className="text-[#4A0E17] font-bold bg-[#E5D3B3]/30 px-1.5 py-0.5 rounded">x{qty}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                <div className="bg-[#4A0E17] p-4 mt-2 rounded-2xl flex justify-between items-center shadow-md">
                   <span className="text-[10px] font-bold text-[#FDFBF7]/80 uppercase tracking-widest">Total Belanja</span>
                   <span className="text-sm font-bold text-[#FDFBF7]">Rp {metrics.totalRevenue.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* VERSI DESKTOP (TABEL MATRIKS) */}
              <div className="hidden sm:block w-full overflow-x-auto pb-2">
                <table className="w-full min-w-max text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-[#E5D3B3]/60">
                      <th className="p-4 font-bold text-[#2B1B17]/60 uppercase tracking-wider w-10">No</th>
                      <th className="p-4 font-bold text-[#2B1B17]/60 uppercase tracking-wider min-w-35">Nama</th>
                      {matrixData.productColumns.map((colName) => (
                        <th key={colName} className="p-4 font-bold text-[#2B1B17]/60 uppercase tracking-wider text-center max-w-30 whitespace-normal leading-tight">
                          {colName}
                        </th>
                      ))}
                      <th className="p-4 font-bold text-[#4A0E17] uppercase tracking-wider text-right min-w-25">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5D3B3]/30">
                    {matrixData.processedOrders.map((order, idx) => (
                      <tr key={order.id} className="hover:bg-[#FDFBF7] transition-colors">
                        <td className="p-4 text-[#2B1B17]/70">{idx + 1}</td>
                        <td className="p-4 font-bold text-[#2B1B17]">
                           {order.passenger_name}
                           <div className="text-[9px] text-[#2B1B17]/40 mt-0.5 font-normal uppercase tracking-widest">
                             Bus {order.bus_number || '1'} • Kursi {order.seat_number || '-'}
                           </div>
                        </td>
                        {matrixData.productColumns.map((colName) => {
                          const qty = order.itemMap?.[colName];
                          return (
                            <td key={colName} className="p-4 text-center font-bold text-[#2B1B17]">
                              {qty ? qty : <span className="text-[#E5D3B3]/40 font-normal">-</span>}
                            </td>
                          );
                        })}
                        <td className="p-4 text-right font-bold text-[#4A0E17]">
                          {order.orderTotal.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#FDFBF7]/50 border-t-2 border-[#E5D3B3]/60">
                    <tr>
                       <td colSpan={2} className="p-4 font-bold text-[#2B1B17] uppercase tracking-widest text-right">
                         Total Keseluruhan
                       </td>
                       {matrixData.productColumns.map((colName) => (
                         <td key={`total-${colName}`} className="p-4 text-center font-bold text-[#2B1B17] text-sm">
                           {matrixData.totals[colName] || 0}
                         </td>
                       ))}
                       <td className="p-4 text-right font-bold text-[#4A0E17] text-sm">
                          Rp {metrics.totalRevenue.toLocaleString('id-ID')}
                       </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ==================== TAB: MATRIKS OPSI 1 (HORIZONTAL SCROLL) ==================== */}
      {activeTab === "matriks_scroll" && (
        <div className="bg-white border border-[#E5D3B3]/60 rounded-3xl overflow-hidden shadow-sm mb-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 border-b border-[#E5D3B3]/40 bg-[#FDFBF7]/30 gap-4">           
            <div className="flex items-center gap-2">
              <Table size={18} className="text-[#4A0E17]" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#2B1B17]">             
                Matriks Pesanan (Scroll)
              </h2>           
            </div>
            <span className="w-fit self-start sm:self-auto text-[10px] font-bold uppercase tracking-widest bg-[#00AA5B]/10 text-[#00AA5B] px-3 py-1.5 rounded-full shrink-0">
               {matrixData.processedOrders.length} Penumpang
            </span>
          </div>
          
          {matrixData.processedOrders.length === 0 ? (
             <p className="text-center text-sm text-[#2B1B17]/40 italic py-12">Belum ada pesanan masuk.</p>
          ) : (
            <div className="w-full overflow-x-auto pb-2">
              {/* Visual hint khusus mobile biar sadar bisa digeser */}
              <div className="text-right sm:hidden px-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-[#2B1B17]/40">
                Geser ke kanan ➔
              </div>
              <table className="w-full min-w-max text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-[#E5D3B3]/60">
                    <th className="p-4 font-bold text-[#2B1B17]/60 uppercase tracking-wider w-10">No</th>
                    <th className="p-4 font-bold text-[#2B1B17]/60 uppercase tracking-wider min-w-35">Nama</th>
                    {matrixData.productColumns.map((colName) => (
                      <th key={colName} className="p-4 font-bold text-[#2B1B17]/60 uppercase tracking-wider text-center max-w-30 whitespace-normal leading-tight">
                        {colName}
                      </th>
                    ))}
                    <th className="p-4 font-bold text-[#4A0E17] uppercase tracking-wider text-right min-w-25">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5D3B3]/30">
                  {matrixData.processedOrders.map((order, idx) => (
                    <tr key={order.id} className="hover:bg-[#FDFBF7] transition-colors">
                      <td className="p-4 text-[#2B1B17]/70">{idx + 1}</td>
                      <td className="p-4 font-bold text-[#2B1B17]">
                         {order.passenger_name}
                         <div className="text-[9px] text-[#2B1B17]/40 mt-0.5 font-normal uppercase tracking-widest">
                           Bus {order.bus_number || '1'} • Kursi {order.seat_number || '-'}
                         </div>
                      </td>
                      {matrixData.productColumns.map((colName) => {
                        const qty = order.itemMap?.[colName];
                        return (
                          <td key={colName} className="p-4 text-center font-bold text-[#2B1B17]">
                            {qty ? qty : <span className="text-[#E5D3B3]/40 font-normal">-</span>}
                          </td>
                        );
                      })}
                      <td className="p-4 text-right font-bold text-[#4A0E17]">
                        {order.orderTotal.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#FDFBF7]/50 border-t-2 border-[#E5D3B3]/60">
                  <tr>
                     <td colSpan={2} className="p-4 font-bold text-[#2B1B17] uppercase tracking-widest text-right">
                       Total Keseluruhan
                     </td>
                     {matrixData.productColumns.map((colName) => (
                       <td key={`total-${colName}`} className="p-4 text-center font-bold text-[#2B1B17] text-sm">
                         {matrixData.totals[colName] || 0}
                       </td>
                     ))}
                     <td className="p-4 text-right font-bold text-[#4A0E17] text-sm">
                        Rp {metrics.totalRevenue.toLocaleString('id-ID')}
                     </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "detail" && (
        <div className="bg-white border border-[#E5D3B3]/60 rounded-3xl overflow-hidden shadow-sm">         
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 border-b border-[#E5D3B3]/40 bg-[#FDFBF7]/30 gap-4">           
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#2B1B17]">             
              Kelola Pesanan           </h2>           
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <input
                  type="text"
                  placeholder="Cari nama atau kursi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-[#E5D3B3] outline-none focus:border-[#4A0E17] bg-white transition-colors"
                />
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2B1B17]/40" />
              </div>

              {session?.status === 'active' && (
                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-1.5 bg-[#4A0E17] text-[#FDFBF7] hover:bg-[#2B1B17] px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm shrink-0"
                >
                  <UserPlus size={14} />
                  <span className="hidden sm:block">Input Pesanan</span>
                </button>
              )}

              <button              
                onClick={handleRefresh}             
                disabled={refreshing}             
                className="flex items-center justify-center text-[10px] font-bold text-[#4A0E17] hover:bg-[#4A0E17]/10 w-8 h-8 rounded-full transition-all disabled:opacity-50 shrink-0"           
              >             
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />             
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
                      <div className="w-10 h-10 rounded-full bg-[#E5D3B3]/20 flex items-center justify-center shrink-0 text-[#4A0E17]">                       
                        <User size={18} />                     
                      </div>                     
                      <div>                       
                        <h3 className="text-sm font-bold text-[#2B1B17]">{order.passenger_name}</h3>                       
                        <p className="text-[10px] uppercase tracking-widest text-[#2B1B17]/50 mt-0.5">                         
                          Bus: <span className="font-bold text-[#2B1B17]/80">{order.bus_number || '1'}</span> • Kursi: <span className="font-bold text-[#2B1B17]/80">{order.seat_number || '-'}</span>                       
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
      )}

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
                  <p className="text-[10px] uppercase tracking-widest text-[#2B1B17]/50 mt-1">
                    Bus: {selectedOrder.bus_number || '1'} • Kursi: {selectedOrder.seat_number || '-'}
                  </p>
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
                            <p className="text-[10px] text-[#2B1B17]/60 font-medium">{item.qty} x {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price_at_checkout)}</p>
                            <p className="text-xs font-bold text-[#4A0E17]">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.qty * item.price_at_checkout)}</p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs font-bold text-[#4A0E17]">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price_at_checkout)}</p>
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
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#E5D3B3] bg-white outline-none focus:border-[#4A0E17] text-[#2B1B17]"
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

      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1B17]/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#E5D3B3]/40">
                <div>
                  <h2 className={`${playfair.className} text-xl font-bold text-[#2B1B17]`}>Input Pesanan Baru</h2>
                  <p className="text-[10px] uppercase tracking-widest text-[#2B1B17]/50 mt-1">Bantu input pesanan penumpang dari dashboard</p>
                </div>
                <button
                  onClick={closeCreateModal}
                  disabled={isSaving}
                  className="p-2 text-[#2B1B17]/40 hover:text-[#4A0E17] transition-colors bg-[#FDFBF7] rounded-full border border-[#E5D3B3]/40 disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateOrderSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-[#FDFBF7]/30">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#2B1B17]/60 block mb-1.5">
                      Nama Penumpang
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={newPassengerName}
                        onChange={(e) => setNewPassengerName(e.target.value)}
                        placeholder="Contoh: Ibu Siti"
                        className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-[#E5D3B3] bg-white outline-none focus:border-[#4A0E17] text-[#2B1B17]"
                      />
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2B1B17]/40" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#2B1B17]/60 block mb-1.5">
                        Nomor Bus
                      </label>
                      <div className="relative">
                        <select
                          value={newBusNumber}
                          onChange={(e) => setNewBusNumber(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-[#E5D3B3] bg-white outline-none focus:border-[#4A0E17] text-[#2B1B17] appearance-none cursor-pointer"
                        >
                          {BUS_NUMBERS.map(num => (
                            <option key={num} value={num}>Bus {num}</option>
                          ))}
                        </select>
                        <Bus size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2B1B17]/40 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#2B1B17]/60 block mb-1.5">
                        Nomor Kursi
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={newSeatNumber}
                          onChange={(e) => setNewSeatNumber(e.target.value)}
                          placeholder="Contoh: 14"
                          className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-[#E5D3B3] bg-white outline-none focus:border-[#4A0E17] text-[#2B1B17]"
                        />
                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2B1B17]/40" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center justify-between border-b border-[#E5D3B3]/40 pb-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#2B1B17]/60">
                        Daftar Produk Dipesan
                      </span>
                      <span className="text-[10px] font-bold text-[#4A0E17]">
                        {newOrderItems.reduce((acc, i) => acc + i.qty, 0)} Item
                      </span>
                    </div>

                    <select
                      onChange={handleSelectProductForNewOrder}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#4A0E17]/40 bg-white outline-none focus:border-[#4A0E17] text-[#2B1B17] font-medium mb-3"
                      defaultValue=""
                    >
                      <option value="">+ Pilih Produk untuk Ditambahkan...</option>
                      {allProducts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} — Rp {p.price.toLocaleString('id-ID')}
                        </option>
                      ))}
                    </select>

                    {newOrderItems.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-[#E5D3B3] rounded-2xl bg-white/50">
                        <ShoppingBag size={24} className="mx-auto text-[#E5D3B3] mb-1.5" />
                        <p className="text-[11px] text-[#2B1B17]/50 font-light">Belum ada produk dipilih.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {newOrderItems.map((item) => (
                          <div key={item.product_id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#E5D3B3]/50 shadow-sm">
                            <div className="pr-2">
                              <h4 className="text-xs font-bold text-[#2B1B17]">{item.products?.name}</h4>
                              <p className="text-[11px] font-semibold text-[#4A0E17] mt-0.5">
                                Rp {(item.qty * item.price_at_checkout).toLocaleString('id-ID')}
                              </p>
                            </div>
                            <div className="flex items-center bg-[#FDFBF7] border border-[#E5D3B3] rounded-full overflow-hidden shrink-0">
                              <button
                                type="button"
                                onClick={() => updateNewItemQty(item.product_id, -1)}
                                className="w-7 h-7 flex items-center justify-center text-[#2B1B17] hover:bg-[#4A0E17]/10 transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-7 text-center text-xs font-bold text-[#2B1B17]">{item.qty}</span>
                              <button
                                type="button"
                                onClick={() => updateNewItemQty(item.product_id, 1)}
                                className="w-7 h-7 flex items-center justify-center text-[#2B1B17] hover:bg-[#4A0E17]/10 transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 sm:p-6 bg-white border-t border-[#E5D3B3]/40">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase tracking-widest text-[#2B1B17]/50 font-bold">Total Tagihan</span>
                    <span className="text-lg font-bold text-[#4A0E17]">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
                        newOrderItems.reduce((sum, item) => sum + (item.qty * item.price_at_checkout), 0)
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={closeCreateModal}
                      disabled={isSaving}
                      className="flex items-center justify-center gap-2 border border-[#E5D3B3] text-[#2B1B17] py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#FDFBF7] transition-all disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving || newOrderItems.length === 0}
                      className="flex items-center justify-center gap-2 bg-[#4A0E17] text-[#FDFBF7] py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#2B1B17] transition-all disabled:opacity-50 shadow-md"
                    >
                      {isSaving ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      ) : (
                        <><Save size={14} /> Simpan Pesanan</>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>   
  ); 
}