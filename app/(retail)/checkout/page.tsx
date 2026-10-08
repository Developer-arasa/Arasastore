"use client";

import { useState, useEffect } from "react";
import { Playfair_Display } from "next/font/google";
import { ArrowLeft, MapPin, Phone, User, ShoppingBag, Trash2, Truck, Store, Clock } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";

const playfair = Playfair_Display({ subsets: ["latin"] });

const OUTLETS = [
  "Arasa Pusat (Jl. Raya By Pass km 50)",
  "Arasa Raden Wijaya (Jl. Raden Wijaya No.5A)",
  "Arasa Stasiun (Stasiun Kereta Api Mojokerto)"
];

export default function CheckoutPage() {
  const { cart, removeFromCart } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    notes: "",
    provinceId: "",
    provinceName: "",
    cityId: "",
    cityName: "",
    districtId: "",
    districtName: "",
    postalCode: "",
    addressDetail: "",
    pickupOutlet: "",
    pickupTime: ""
  });

  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [isLoadingRegion, setIsLoadingRegion] = useState({ prov: false, city: false, dist: false });

  useEffect(() => {
    setIsMounted(true);
    const fetchProvinces = async () => {
      setIsLoadingRegion(prev => ({ ...prev, prov: true }));
      try {
        const res = await fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json");
        const data = await res.json();
        setProvinces(data);
      } catch (err) {
        console.error("Gagal menarik data provinsi", err);
      } finally {
        setIsLoadingRegion(prev => ({ ...prev, prov: false }));
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!formData.provinceId) return;
    const fetchCities = async () => {
      setIsLoadingRegion(prev => ({ ...prev, city: true }));
      try {
        const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${formData.provinceId}.json`);
        const data = await res.json();
        setCities(data);
      } catch (err) {
        console.error("Gagal menarik data kota", err);
      } finally {
        setIsLoadingRegion(prev => ({ ...prev, city: false }));
      }
    };
    fetchCities();
  }, [formData.provinceId]);

  useEffect(() => {
    if (!formData.cityId) return;
    const fetchDistricts = async () => {
      setIsLoadingRegion(prev => ({ ...prev, dist: true }));
      try {
        const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${formData.cityId}.json`);
        const data = await res.json();
        setDistricts(data);
      } catch (err) {
        console.error("Gagal menarik data kecamatan", err);
      } finally {
        setIsLoadingRegion(prev => ({ ...prev, dist: false }));
      }
    };
    fetchDistricts();
  }, [formData.cityId]);

  const totalAmount = cart.reduce((total, item) => total + item.price * item.qty, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setFormData(prev => ({ 
      ...prev, provinceId: id, provinceName: name, 
      cityId: "", cityName: "", districtId: "", districtName: ""
    }));
    setCities([]);
    setDistricts([]);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setFormData(prev => ({ 
      ...prev, cityId: id, cityName: name, 
      districtId: "", districtName: ""
    }));
    setDistricts([]);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setFormData(prev => ({ ...prev, districtId: id, districtName: name }));
  };

  // refactored logic: validasi dipisah berdasarkan metode delivery
  const isFormValid = () => {
    if (deliveryMethod === "delivery") {
      return formData.name && formData.phone && formData.provinceId && formData.cityId && formData.districtId && formData.postalCode && formData.addressDetail;
    } else {
      return formData.pickupOutlet && formData.pickupTime;
    }
  };

  // refactored logic: format WA dinamis mengikuti metode
  const handleCheckoutWA = () => {
    const waNumber = "628155138385";
    
    let orderText = `Halo Admin Arasa, saya ingin memproses pesanan berikut:\n\n`;
    orderText += `*METODE: ${deliveryMethod === 'delivery' ? 'KIRIM KE ALAMAT' : 'AMBIL DI TOKO'}*\n\n`;
    
    if (deliveryMethod === 'delivery') {
      orderText += `*DATA PEMBELI*\n`;
      orderText += `Nama: ${formData.name}\n`;
      orderText += `No. HP: ${formData.phone}\n`;
      orderText += `\n*ALAMAT PENGIRIMAN*\n`;
      orderText += `Provinsi: ${formData.provinceName}\n`;
      orderText += `Kota/Kab: ${formData.cityName}\n`;
      orderText += `Kecamatan: ${formData.districtName}\n`;
      orderText += `Kode Pos: ${formData.postalCode}\n`;
      orderText += `Detail Jalan: ${formData.addressDetail}\n`;
    } else {
      orderText += `*PENGAMBILAN (PICK-UP)*\n`;
      orderText += `Outlet: ${formData.pickupOutlet}\n`;
      orderText += `Estimasi Waktu: ${formData.pickupTime}\n`;
    }
    
    if (formData.notes) orderText += `\nCatatan: ${formData.notes}\n`;
    
    orderText += `\n*RINGKASAN PESANAN*\n`;
    cart.forEach((item, index) => {
      orderText += `${index + 1}. ${item.name} (${item.qty}x) - Rp ${item.price * item.qty}\n`;
    });
    
    orderText += `\n*SUBTOTAL: Rp ${totalAmount}*\n\n`;
    orderText += `Mohon info ketersediaan${deliveryMethod === 'delivery' ? ' dan rincian ongkos kirim' : ''}. Terima kasih.`;

    const encodedText = encodeURIComponent(orderText);
    window.open(`https://wa.me/${waNumber}?text=${encodedText}`, "_blank");
  };

  if (!isMounted) return null;

  return (
    <div className="bg-[#FDFBF7] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/the-collection" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-[#2B1B17]/60 hover:text-[#4A0E17] transition-colors mb-10 font-medium">
          <ArrowLeft size={16} /> Kembali Belanja
        </Link>

        <h1 className={`${playfair.className} text-3xl sm:text-4xl font-bold text-[#2B1B17] mb-8`}>
          Checkout
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#E5D3B3]/40 rounded-2xl shadow-sm">
            <ShoppingBag size={48} className="mx-auto text-[#E5D3B3] mb-4" />
            <h2 className="text-xl font-bold text-[#2B1B17] mb-2">Keranjang Kosong</h2>
            <p className="text-[#2B1B17]/60 mb-6">Belum ada produk yang dipilih.</p>
            <Link href="/the-collection" className="inline-block bg-[#4A0E17] text-[#FDFBF7] px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#2B1B17] transition-all">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white p-2 rounded-2xl border border-[#E5D3B3]/40 shadow-sm flex">
                <button 
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${deliveryMethod === 'delivery' ? 'bg-[#4A0E17] text-[#FDFBF7]' : 'text-[#2B1B17]/60 hover:bg-[#E5D3B3]/20'}`}
                >
                  <Truck size={16} /> Dikirim
                </button>
                <button 
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${deliveryMethod === 'pickup' ? 'bg-[#4A0E17] text-[#FDFBF7]' : 'text-[#2B1B17]/60 hover:bg-[#E5D3B3]/20'}`}
                >
                  <Store size={16} /> Ambil di Toko
                </button>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5D3B3]/40 shadow-sm">
                <h2 className="text-lg font-bold text-[#2B1B17] mb-6 uppercase tracking-widest border-b border-[#E5D3B3]/40 pb-4">
                  Informasi {deliveryMethod === 'delivery' ? 'Pengiriman' : 'Pengambilan'}
                </h2>
                
                <div className="space-y-5">
                  {deliveryMethod === 'delivery' ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#2B1B17]/70 font-bold mb-2">
                            <User size={14} /> Nama Lengkap
                          </label>
                          <input 
                            type="text" name="name" value={formData.name} onChange={handleInputChange}
                            className="w-full bg-[#FDFBF7] border border-[#E5D3B3] px-4 py-3 rounded-xl outline-none focus:border-[#4A0E17] transition-all"
                            placeholder="Masukkan nama Anda"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#2B1B17]/70 font-bold mb-2">
                            <Phone size={14} /> Nomor WhatsApp
                          </label>
                          <input 
                            type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                            className="w-full bg-[#FDFBF7] border border-[#E5D3B3] px-4 py-3 rounded-xl outline-none focus:border-[#4A0E17] transition-all"
                            placeholder="Contoh: 08123456789"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-[#E5D3B3]/20">
                        <div>
                          <label className="text-xs uppercase tracking-widest text-[#2B1B17]/70 font-bold mb-2 block">Provinsi</label>
                          <select 
                            value={formData.provinceId} onChange={handleProvinceChange}
                            className="w-full bg-[#FDFBF7] border border-[#E5D3B3] px-4 py-3 rounded-xl outline-none focus:border-[#4A0E17] transition-all text-sm"
                          >
                            <option value="">{isLoadingRegion.prov ? "Memuat..." : "Pilih Provinsi"}</option>
                            {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-widest text-[#2B1B17]/70 font-bold mb-2 block">Kota / Kabupaten</label>
                          <select 
                            value={formData.cityId} onChange={handleCityChange} disabled={!formData.provinceId}
                            className="w-full bg-[#FDFBF7] border border-[#E5D3B3] px-4 py-3 rounded-xl outline-none focus:border-[#4A0E17] transition-all text-sm disabled:opacity-50"
                          >
                            <option value="">{isLoadingRegion.city ? "Memuat..." : "Pilih Kota/Kab"}</option>
                            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-widest text-[#2B1B17]/70 font-bold mb-2 block">Kecamatan</label>
                          <select 
                            value={formData.districtId} onChange={handleDistrictChange} disabled={!formData.cityId}
                            className="w-full bg-[#FDFBF7] border border-[#E5D3B3] px-4 py-3 rounded-xl outline-none focus:border-[#4A0E17] transition-all text-sm disabled:opacity-50"
                          >
                            <option value="">{isLoadingRegion.dist ? "Memuat..." : "Pilih Kecamatan"}</option>
                            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-widest text-[#2B1B17]/70 font-bold mb-2 block">Kode Pos</label>
                          <input 
                            type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange}
                            className="w-full bg-[#FDFBF7] border border-[#E5D3B3] px-4 py-3 rounded-xl outline-none focus:border-[#4A0E17] transition-all text-sm"
                            placeholder="Contoh: 61321"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#2B1B17]/70 font-bold mb-2">
                          <MapPin size={14} /> Detail Jalan / Alamat
                        </label>
                        <textarea 
                          name="addressDetail" value={formData.addressDetail} onChange={handleInputChange} rows={2}
                          className="w-full bg-[#FDFBF7] border border-[#E5D3B3] px-4 py-3 rounded-xl outline-none focus:border-[#4A0E17] transition-all resize-none text-sm"
                          placeholder="Nama jalan, RT/RW, nomor rumah, atau patokan khusus"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#2B1B17]/70 font-bold mb-2 block">
                          <Store size={14} /> Pilih Outlet
                        </label>
                        <select 
                          name="pickupOutlet" value={formData.pickupOutlet} onChange={handleInputChange}
                          className="w-full bg-[#FDFBF7] border border-[#E5D3B3] px-4 py-3 rounded-xl outline-none focus:border-[#4A0E17] transition-all text-sm"
                        >
                          <option value="">Pilih Outlet Pengambilan</option>
                          {OUTLETS.map(out => <option key={out} value={out}>{out}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#2B1B17]/70 font-bold mb-2 block">
                          <Clock size={14} /> Waktu Pengambilan
                        </label>
                        <input 
                          type="datetime-local" name="pickupTime" value={formData.pickupTime} onChange={handleInputChange}
                          className="w-full bg-[#FDFBF7] border border-[#E5D3B3] px-4 py-3 rounded-xl outline-none focus:border-[#4A0E17] transition-all text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div className={`${deliveryMethod === 'pickup' ? 'pt-2 border-t border-[#E5D3B3]/20' : ''}`}>
                    <label className="text-xs uppercase tracking-widest text-[#2B1B17]/70 font-bold mb-2 block">Catatan (Opsional)</label>
                    <input 
                      type="text" name="notes" value={formData.notes} onChange={handleInputChange}
                      className="w-full bg-[#FDFBF7] border border-[#E5D3B3] px-4 py-3 rounded-xl outline-none focus:border-[#4A0E17] transition-all text-sm"
                      placeholder="Contoh: Tolong dipisah per box"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[#F5F0E6]/50 p-6 sm:p-8 rounded-2xl border border-[#E5D3B3]/40 sticky top-24">
                <h2 className="text-lg font-bold text-[#2B1B17] mb-6 uppercase tracking-widest border-b border-[#E5D3B3]/40 pb-4">
                  Ringkasan
                </h2>
                
                <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 no-scrollbar">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 items-start">
                      <div 
                        className="w-16 h-16 rounded-lg bg-cover bg-center shrink-0 border border-[#E5D3B3]/50"
                        style={{ backgroundImage: `url('${item.image}')` }}
                      />
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-[#2B1B17] line-clamp-2">{item.name}</h3>
                        <p className="text-xs text-[#2B1B17]/60 mt-1">{item.qty} x Rp {item.price.toLocaleString('id-ID')}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#2B1B17]/40 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#E5D3B3]/40 pt-4 mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#2B1B17]/70">Subtotal</span>
                    <span className="font-bold text-[#2B1B17]">Rp {totalAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#2B1B17]/70">{deliveryMethod === 'delivery' ? 'Ongkos Kirim' : 'Biaya Penanganan'}</span>
                    <span className="text-sm italic text-[#2B1B17]/50">{deliveryMethod === 'delivery' ? 'Dihitung admin' : 'Gratis'}</span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckoutWA}
                  disabled={!isFormValid()}
                  className="w-full bg-[#4A0E17] text-[#FDFBF7] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2B1B17] px-6 py-4 rounded-full text-sm font-bold uppercase tracking-widest transition-all shadow-lg"
                >
                  Proses Pesanan
                </button>
                {!isFormValid() && (
                  <p className="text-[10px] text-center text-red-500/80 mt-3 uppercase tracking-widest">
                    Lengkapi data {deliveryMethod === 'delivery' ? 'pengiriman' : 'pengambilan'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}