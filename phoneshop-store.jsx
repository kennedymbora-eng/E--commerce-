import React, { useState, useMemo, useCallback } from "react";
import { Search, ShoppingCart, X, Plus, Minus, Phone, MapPin, Check, ChevronRight, Zap, Package, MessageCircle } from "lucide-react";

// ---------- Demo data (swap for Firestore later) ----------
const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "chargers", label: "Chargers & Cables" },
  { id: "audio", label: "Earphones & Audio" },
  { id: "protection", label: "Screen & Cases" },
  { id: "power", label: "Power Banks" },
  { id: "accessories", label: "Accessories" },
  { id: "repair", label: "Repair Parts" },
];

const PRODUCTS = [
  { id: "p1", name: "Fast Charger 33W Type-C", cat: "chargers", price: 650, stock: 24, tag: "Best Seller", img: "charger fast type-c" },
  { id: "p2", name: "Braided USB-C Cable 1m", cat: "chargers", price: 250, stock: 40, tag: null, img: "usb type-c cable braided" },
  { id: "p3", name: "Wireless Earbuds Pro", cat: "audio", price: 1800, stock: 12, tag: "Hot", img: "wireless earbuds black" },
  { id: "p4", name: "Handsfree 3.5mm Stereo", cat: "audio", price: 200, stock: 55, tag: null, img: "wired earphones" },
  { id: "p5", name: "Tempered Glass Screen Protector", cat: "protection", price: 150, stock: 80, tag: null, img: "phone screen protector glass" },
  { id: "p6", name: "Shockproof Silicone Case", cat: "protection", price: 350, stock: 33, tag: null, img: "phone case silicone" },
  { id: "p7", name: "Power Bank 20000mAh", cat: "power", price: 2200, stock: 9, tag: "Limited", img: "power bank 20000mah" },
  { id: "p8", name: "Power Bank 10000mAh Slim", cat: "power", price: 1400, stock: 18, tag: null, img: "power bank slim" },
  { id: "p9", name: "Phone Holder / Car Mount", cat: "accessories", price: 400, stock: 21, tag: null, img: "car phone mount holder" },
  { id: "p10", name: "Selfie Ring Light", cat: "accessories", price: 900, stock: 14, tag: null, img: "selfie ring light" },
  { id: "p11", name: "Replacement Battery (Universal)", cat: "repair", price: 800, stock: 17, tag: null, img: "phone battery replacement" },
  { id: "p12", name: "LCD Screen Assembly (Common Models)", cat: "repair", price: 2800, stock: 6, tag: "Repair Shop Special", img: "phone lcd screen assembly" },
  { id: "p13", name: "Micro USB Cable 1m", cat: "chargers", price: 150, stock: 60, tag: null, img: "micro usb cable" },
  { id: "p14", name: "Bluetooth Neckband Earphones", cat: "audio", price: 950, stock: 20, tag: null, img: "bluetooth neckband earphones" },
  { id: "p15", name: "Flip Cover Wallet Case", cat: "protection", price: 450, stock: 25, tag: null, img: "phone flip wallet case" },
  { id: "p16", name: "Car Charger Dual Port", cat: "chargers", price: 300, stock: 30, tag: null, img: "car charger dual usb" },
];

const SHOP = {
  name: "ElectroPro Phone & Accessories",
  location: "Manyatta, Embu, Kenya",
  phone: "0700 000 000",
  tillNumber: "123456",
  whatsapp: "254700000000",
};

function KES(n) {
  return `KSh ${n.toLocaleString("en-KE")}`;
}

// ---------- Price sticker (signature element) ----------
function PriceSticker({ amount }) {
  return (
    <div className="relative inline-block">
      <div
        className="px-2.5 py-1 text-[13px] font-bold tracking-tight"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          background: "#FF6B2C",
          color: "#0B1220",
          clipPath:
            "polygon(4% 0%, 96% 0%, 100% 20%, 96% 40%, 100% 60%, 96% 80%, 100% 100%, 4% 100%, 0% 80%, 4% 60%, 0% 40%, 4% 20%)",
        }}
      >
        {KES(amount)}
      </div>
    </div>
  );
}

function ProductImg({ label }) {
  // Placeholder visual block styled like a component/device silhouette (no external images needed)
  return (
    <div
      className="w-full aspect-square rounded-lg flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #101a2e 0%, #0B1220 100%)" }}
    >
      <div className="absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, #FF6B2C 1px, transparent 0)",
        backgroundSize: "14px 14px",
      }} />
      <Zap size={30} strokeWidth={1.5} className="relative z-10" style={{ color: "#FF6B2C" }} />
    </div>
  );
}

export default function App() {
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState({}); // id -> qty
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0 = cart, 1 = details, 2 = confirm
  const [payMethod, setPayMethod] = useState("mpesa_manual");
  const [customer, setCustomer] = useState({ name: "", phone: "", location: "" });
  const [orderPlaced, setOrderPlaced] = useState(null);

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchCat = cat === "all" || p.cat === cat;
      const matchQuery = p.name.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [cat, query]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ ...PRODUCTS.find((p) => p.id === id), qty }));
  }, [cart]);

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.qty * i.price, 0);

  const addToCart = useCallback((id) => {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  }, []);
  const changeQty = useCallback((id, delta) => {
    setCart((c) => {
      const next = Math.max(0, (c[id] || 0) + delta);
      return { ...c, [id]: next };
    });
  }, []);

  const placeOrder = () => {
    const orderId = "ORD-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    setOrderPlaced({
      id: orderId,
      items: cartItems,
      total: cartTotal,
      customer,
      payMethod,
    });
    setCheckoutStep(3);
  };

  const resetOrder = () => {
    setCart({});
    setCartOpen(false);
    setCheckoutStep(0);
    setOrderPlaced(null);
    setCustomer({ name: "", phone: "", location: "" });
  };

  const whatsappOrderLink = () => {
    if (!orderPlaced) return "#";
    const lines = orderPlaced.items.map((i) => `- ${i.name} x${i.qty} = ${KES(i.price * i.qty)}`).join("%0A");
    const msg = `Order ${orderPlaced.id}%0AName: ${orderPlaced.customer.name}%0APhone: ${orderPlaced.customer.phone}%0ALocation: ${orderPlaced.customer.location}%0A%0AItems:%0A${lines}%0A%0ATotal: ${KES(orderPlaced.total)}%0APayment: ${orderPlaced.payMethod === "mpesa_manual" ? "M-Pesa Till " + SHOP.tillNumber : "Cash on Delivery"}`;
    return `https://wa.me/${SHOP.whatsapp}?text=${msg}`;
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "#F5F3EC", fontFamily: "'Inter', sans-serif", color: "#0B1220" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
      `}</style>

      {/* Top bar */}
      <div style={{ background: "#0B1220" }} className="text-white text-xs px-4 py-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5 opacity-80">
          <MapPin size={12} /> {SHOP.location}
        </span>
        <a href={`tel:${SHOP.phone}`} className="flex items-center gap-1.5 opacity-80 hover:opacity-100">
          <Phone size={12} /> {SHOP.phone}
        </a>
      </div>

      {/* Header / counter strip */}
      <header className="sticky top-0 z-30 backdrop-blur border-b" style={{ background: "rgba(245,243,236,0.92)", borderColor: "#0B1220" }}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "#0B1220" }}>
                <Zap size={18} style={{ color: "#FF6B2C" }} />
              </div>
              <div>
                <div className="font-bold leading-none text-[15px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {SHOP.name}
                </div>
                <div className="text-[11px] leading-none mt-0.5" style={{ color: "#8B93A6", fontFamily: "'JetBrains Mono', monospace" }}>
                  Manyatta counter, open now
                </div>
              </div>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-md font-semibold text-sm text-white flex-shrink-0"
              style={{ background: "#0B1220" }}
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: "#FF6B2C", color: "#0B1220" }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          <div className="mt-3 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#8B93A6" }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chargers, earphones, screen protectors..."
              className="w-full pl-9 pr-3 py-2.5 rounded-md text-sm outline-none border"
              style={{ borderColor: "#0B1220", background: "white" }}
            />
          </div>

          {/* Category chips */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
                style={
                  cat === c.id
                    ? { background: "#FF6B2C", color: "#0B1220", borderColor: "#FF6B2C" }
                    : { background: "transparent", color: "#0B1220", borderColor: "#8B93A6" }
                }
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Product grid */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-baseline justify-between mb-4">
          <h1 className="font-bold text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {cat === "all" ? "All Stock" : CATEGORIES.find((c) => c.id === cat)?.label}
          </h1>
          <span className="text-xs" style={{ color: "#8B93A6", fontFamily: "'JetBrains Mono', monospace" }}>
            {filtered.length} items
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package size={32} className="mx-auto mb-2" style={{ color: "#8B93A6" }} />
            <p style={{ color: "#8B93A6" }} className="text-sm">No items match "{query}". Try another search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((p) => (
              <div key={p.id} className="rounded-lg border p-2.5 flex flex-col" style={{ borderColor: "#0B1220", background: "white" }}>
                <div className="relative">
                  <ProductImg label={p.img} />
                  {p.tag && (
                    <span
                      className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: "#1FA97A", color: "white" }}
                    >
                      {p.tag}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex-1">
                  <div className="text-[13px] font-semibold leading-snug" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {p.name}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: "#8B93A6", fontFamily: "'JetBrains Mono', monospace" }}>
                    {p.stock} in stock
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between gap-1.5">
                  <PriceSticker amount={p.price} />
                  {cart[p.id] > 0 ? (
                    <div className="flex items-center gap-1 rounded-md border px-1" style={{ borderColor: "#0B1220" }}>
                      <button onClick={() => changeQty(p.id, -1)} className="p-1"><Minus size={12} /></button>
                      <span className="text-xs font-bold w-4 text-center" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{cart[p.id]}</span>
                      <button onClick={() => changeQty(p.id, 1)} className="p-1"><Plus size={12} /></button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(p.id)}
                      className="p-2 rounded-md"
                      style={{ background: "#0B1220", color: "white" }}
                      aria-label={`Add ${p.name} to cart`}
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart / Checkout Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setCartOpen(false); setCheckoutStep(0); }} />
          <div className="relative w-full sm:w-[420px] h-full bg-white flex flex-col" style={{ background: "#F5F3EC" }}>
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#0B1220" }}>
              <h2 className="font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {checkoutStep === 0 && "Your Cart"}
                {checkoutStep === 1 && "Delivery Details"}
                {checkoutStep === 2 && "Payment"}
                {checkoutStep === 3 && "Order Placed"}
              </h2>
              <button onClick={() => { setCartOpen(false); setCheckoutStep(0); }} className="p-1"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              {/* Step 0: cart items */}
              {checkoutStep === 0 && (
                cartItems.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingCart size={28} className="mx-auto mb-2" style={{ color: "#8B93A6" }} />
                    <p className="text-sm" style={{ color: "#8B93A6" }}>Cart is empty. Add something from the shop.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map((i) => (
                      <div key={i.id} className="flex items-center gap-3 bg-white rounded-lg p-2 border" style={{ borderColor: "#0B1220" }}>
                        <div className="w-14 h-14 flex-shrink-0"><ProductImg label={i.img} /></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold truncate">{i.name}</div>
                          <div className="text-xs mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#8B93A6" }}>{KES(i.price)} each</div>
                        </div>
                        <div className="flex items-center gap-1 rounded-md border px-1" style={{ borderColor: "#0B1220" }}>
                          <button onClick={() => changeQty(i.id, -1)} className="p-1"><Minus size={12} /></button>
                          <span className="text-xs font-bold w-4 text-center" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{i.qty}</span>
                          <button onClick={() => changeQty(i.id, 1)} className="p-1"><Plus size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Step 1: delivery details */}
              {checkoutStep === 1 && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold block mb-1">Full name</label>
                    <input
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-md border text-sm outline-none"
                      style={{ borderColor: "#0B1220" }}
                      placeholder="e.g. Kevin Mwangi"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">Phone number</label>
                    <input
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-md border text-sm outline-none"
                      style={{ borderColor: "#0B1220" }}
                      placeholder="07XX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">Delivery location</label>
                    <input
                      value={customer.location}
                      onChange={(e) => setCustomer({ ...customer, location: e.target.value })}
                      className="w-full px-3 py-2 rounded-md border text-sm outline-none"
                      style={{ borderColor: "#0B1220" }}
                      placeholder="e.g. Manyatta, near Embu Bus Park"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: payment */}
              {checkoutStep === 2 && (
                <div className="space-y-3">
                  <button
                    onClick={() => setPayMethod("mpesa_manual")}
                    className="w-full text-left p-3 rounded-lg border flex items-center justify-between"
                    style={{ borderColor: payMethod === "mpesa_manual" ? "#1FA97A" : "#0B1220", background: payMethod === "mpesa_manual" ? "#eafbf3" : "white" }}
                  >
                    <div>
                      <div className="text-sm font-semibold">M-Pesa (Buy Goods)</div>
                      <div className="text-xs mt-0.5" style={{ color: "#8B93A6" }}>Till Number {SHOP.tillNumber}</div>
                    </div>
                    {payMethod === "mpesa_manual" && <Check size={16} style={{ color: "#1FA97A" }} />}
                  </button>
                  <button
                    onClick={() => setPayMethod("cod")}
                    className="w-full text-left p-3 rounded-lg border flex items-center justify-between"
                    style={{ borderColor: payMethod === "cod" ? "#1FA97A" : "#0B1220", background: payMethod === "cod" ? "#eafbf3" : "white" }}
                  >
                    <div>
                      <div className="text-sm font-semibold">Cash on Delivery</div>
                      <div className="text-xs mt-0.5" style={{ color: "#8B93A6" }}>Pay when your order arrives</div>
                    </div>
                    {payMethod === "cod" && <Check size={16} style={{ color: "#1FA97A" }} />}
                  </button>
                  {payMethod === "mpesa_manual" && (
                    <div className="text-xs p-3 rounded-md" style={{ background: "#0B1220", color: "white" }}>
                      Go to M-Pesa → Lipa na M-Pesa → Buy Goods → Till <b>{SHOP.tillNumber}</b> → enter amount <b>{KES(cartTotal)}</b>. We'll confirm on WhatsApp after you place the order.
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: confirmation */}
              {checkoutStep === 3 && orderPlaced && (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-3" style={{ background: "#1FA97A" }}>
                    <Check size={26} color="white" />
                  </div>
                  <div className="font-bold text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Order placed!</div>
                  <div className="text-xs mt-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#8B93A6" }}>{orderPlaced.id}</div>
                  <p className="text-sm mt-3" style={{ color: "#8B93A6" }}>
                    Confirm your order on WhatsApp to notify the shop right away.
                  </p>
                  <a
                    href={whatsappOrderLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-md font-semibold text-sm text-white"
                    style={{ background: "#1FA97A" }}
                  >
                    <MessageCircle size={16} /> Confirm on WhatsApp
                  </a>
                  <div className="mt-6">
                    <button onClick={resetOrder} className="text-xs underline" style={{ color: "#8B93A6" }}>Continue shopping</button>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer footer */}
            {checkoutStep < 3 && (
              <div className="border-t px-4 py-3" style={{ borderColor: "#0B1220", background: "white" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-base font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{KES(cartTotal)}</span>
                </div>
                <div className="flex gap-2">
                  {checkoutStep > 0 && (
                    <button
                      onClick={() => setCheckoutStep((s) => s - 1)}
                      className="px-4 py-2.5 rounded-md text-sm font-semibold border"
                      style={{ borderColor: "#0B1220" }}
                    >
                      Back
                    </button>
                  )}
                  <button
                    disabled={cartItems.length === 0 || (checkoutStep === 1 && (!customer.name || !customer.phone || !customer.location))}
                    onClick={() => {
                      if (checkoutStep === 2) placeOrder();
                      else setCheckoutStep((s) => s + 1);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md text-sm font-semibold text-white disabled:opacity-40"
                    style={{ background: "#FF6B2C", color: "#0B1220" }}
                  >
                    {checkoutStep === 0 && "Proceed to checkout"}
                    {checkoutStep === 1 && "Continue to payment"}
                    {checkoutStep === 2 && "Place order"}
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="text-center py-6 text-xs" style={{ color: "#8B93A6" }}>
        {SHOP.name} · {SHOP.location} · Demo catalog — connect Firestore for live inventory
      </footer>
    </div>
  );
}
