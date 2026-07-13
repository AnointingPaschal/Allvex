import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Heart, GitCompareArrows, BadgeCheck, ShoppingCart, Plus, Minus, X, Star, Check } from "lucide-react";
import VehicleArt from "../components/VehicleArt.jsx";
import { vehicles, accessories } from "../data/mock.js";

const categories = ["All", "SUV", "Sedan", "Electric", "Pickup", "Luxury"];

export default function Marketplace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("vehicles"); // "vehicles" | "accessories"
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState({}); // { [id]: qty }
  const [showCart, setShowCart] = useState(false);
  const [justAdded, setJustAdded] = useState(null);
  const [checkoutDone, setCheckoutDone] = useState(false);

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesCat = active === "All" || v.category === active;
      const matchesQuery = `${v.brand} ${v.model}`.toLowerCase().includes(query.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [active, query]);

  const filteredAccessories = useMemo(() => {
    return accessories.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  function addToCart(id) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
    setJustAdded(id);
    setTimeout(() => setJustAdded((cur) => (cur === id ? null : cur)), 1200);
  }
  function changeQty(id, delta) {
    setCart((c) => {
      const next = { ...c, [id]: Math.max(0, (c[id] || 0) + delta) };
      if (next[id] === 0) delete next[id];
      return next;
    });
  }

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartItems = Object.entries(cart).map(([id, qty]) => ({ ...accessories.find((a) => a.id === Number(id)), qty }));
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="pb-8">
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-3.5 bg-white sticky top-0 z-30 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-[17px] font-bold text-midnight">Marketplace</h1>
          {tab === "accessories" && (
            <button onClick={() => setShowCart(true)} className="tap relative w-9 h-9 rounded-xl bg-midnight flex items-center justify-center">
              <ShoppingCart size={15} className="text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-electric text-white text-[9px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Shop tabs */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setTab("vehicles")}
            className={`tap flex-1 py-2.5 rounded-xl text-[12.5px] font-semibold ${tab === "vehicles" ? "bg-electric text-white" : "bg-slate-100 text-slate-500"}`}
          >
            Vehicles
          </button>
          <button
            onClick={() => setTab("accessories")}
            className={`tap flex-1 py-2.5 rounded-xl text-[12.5px] font-semibold ${tab === "accessories" ? "bg-electric text-white" : "bg-slate-100 text-slate-500"}`}
          >
            Accessories
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 max-w-md flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
            <Search size={14} className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === "vehicles" ? "Search brand or model..." : "Search accessories..."}
              className="bg-transparent outline-none text-[12px] w-full placeholder:text-slate-400"
            />
          </div>
          {tab === "vehicles" && (
            <button className="tap w-9 h-9 rounded-xl bg-midnight flex items-center justify-center shrink-0">
              <SlidersHorizontal size={14} className="text-white" />
            </button>
          )}
        </div>

        {tab === "vehicles" && (
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar mt-3">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`tap shrink-0 px-3.5 py-1.5 rounded-pill text-[11px] font-semibold ${
                  active === c ? "bg-electric text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* VEHICLES TAB */}
      {tab === "vehicles" && (
        <>
          <div className="px-4 sm:px-6 lg:px-8 mt-3.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((v) => (
              <button
                key={v.id}
                onClick={() => navigate(`/marketplace/${v.id}`)}
                className="tap bg-white rounded-xl shadow-card overflow-hidden text-left flex flex-col"
              >
                <div className="relative">
                  <VehicleArt category={v.category} src={v.image} className="h-24 w-full" iconSize={24} />
                  <button className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                    <Heart size={11} className="text-midnight" />
                  </button>
                  {v.verified && (
                    <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-white/90 rounded-pill px-1.5 py-0.5 text-[9px] font-semibold text-electric">
                      <BadgeCheck size={9} /> Verified
                    </span>
                  )}
                </div>
                <div className="p-2.5 flex-1 flex flex-col">
                  <p className="font-semibold text-midnight text-[11.5px] truncate">{v.brand} {v.model}</p>
                  <p className="text-[9.5px] text-slate-400 mt-0.5">{v.year} · {v.fuel}</p>
                  <p className="text-[11.5px] font-bold text-midnight mt-1">₦{(v.price / 1000000).toFixed(1)}m</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Est. landing · {v.delivery}</p>
                  <button className="tap mt-1.5 flex items-center gap-1 text-[9.5px] font-semibold text-electric">
                    <GitCompareArrows size={10} /> Compare
                  </button>
                </div>
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="px-4 sm:px-6 lg:px-8 mt-16 text-center">
              <p className="text-slate-400 text-[12.5px]">No vehicles match your search.</p>
            </div>
          )}
        </>
      )}

      {/* ACCESSORIES TAB */}
      {tab === "accessories" && (
        <>
          <div className="px-4 sm:px-6 lg:px-8 mt-3.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredAccessories.map((a) => (
              <div key={a.id} className="bg-white rounded-xl shadow-card overflow-hidden flex flex-col">
                <VehicleArt category="default" src={a.image} className="h-24 w-full" iconSize={22} />
                <div className="p-2.5 flex-1 flex flex-col">
                  <p className="font-semibold text-midnight text-[11.5px] truncate">{a.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={10} className="text-warning fill-warning" />
                    <span className="text-[9.5px] text-slate-400">{a.rating}</span>
                  </div>
                  <p className="text-[12px] font-bold text-electric mt-1">₦{a.price.toLocaleString()}</p>
                  <button
                    onClick={() => addToCart(a.id)}
                    className={`tap mt-2 w-full py-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 ${
                      justAdded === a.id ? "bg-success text-white" : "bg-midnight text-white"
                    }`}
                  >
                    {justAdded === a.id ? (
                      <><Check size={12} /> Added</>
                    ) : (
                      <><Plus size={12} /> Add to Cart</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          {filteredAccessories.length === 0 && (
            <div className="px-4 sm:px-6 lg:px-8 mt-16 text-center">
              <p className="text-slate-400 text-[12.5px]">No accessories match your search.</p>
            </div>
          )}

          {/* Floating cart button */}
          {cartCount > 0 && (
            <button
              onClick={() => setShowCart(true)}
              className="tap fixed bottom-24 right-4 sm:right-8 z-40 flex items-center gap-2 bg-midnight text-white pl-4 pr-3 py-3 rounded-pill shadow-lg"
            >
              <span className="text-[12px] font-semibold">₦{cartTotal.toLocaleString()}</span>
              <span className="w-6 h-6 rounded-full bg-electric flex items-center justify-center text-[11px] font-bold">{cartCount}</span>
            </button>
          )}
        </>
      )}

      {/* Cart drawer */}
      {showCart && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50" onClick={() => setShowCart(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full sm:w-[420px] sm:rounded-xl rounded-t-[24px] p-5 pb-7 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14.5px] font-bold text-midnight">Your Cart</h3>
              <button onClick={() => setShowCart(false)}><X size={18} className="text-slate-400" /></button>
            </div>

            {cartItems.length === 0 && !checkoutDone ? (
              <p className="text-[12.5px] text-slate-400 text-center py-8">Your cart is empty.</p>
            ) : checkoutDone ? (
              <div className="py-8 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
                  <Check size={22} className="text-success" />
                </div>
                <p className="text-[14px] font-bold text-midnight">Order placed</p>
                <p className="text-[12px] text-slate-400 mt-1 max-w-[240px]">
                  You'll receive a confirmation and delivery estimate in your Orders shortly.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <VehicleArt category="default" src={item.image} className="w-14 h-14 rounded-lg shrink-0" iconSize={16} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-midnight truncate">{item.name}</p>
                      <p className="text-[11.5px] font-bold text-electric mt-0.5">₦{item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-1.5 py-1">
                      <button onClick={() => changeQty(item.id, -1)} className="tap w-6 h-6 flex items-center justify-center">
                        <Minus size={12} className="text-midnight" />
                      </button>
                      <span className="text-[12px] font-semibold w-4 text-center">{item.qty}</span>
                      <button onClick={() => changeQty(item.id, 1)} className="tap w-6 h-6 flex items-center justify-center">
                        <Plus size={12} className="text-midnight" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="border-t border-slate-100 pt-3.5 mt-1 flex items-center justify-between">
                  <span className="text-[12.5px] text-slate-400">Subtotal</span>
                  <span className="text-[15px] font-bold text-midnight">₦{cartTotal.toLocaleString()}</span>
                </div>

                <button
                  onClick={checkout}
                  className="tap w-full py-3 rounded-xl bg-electric text-white font-semibold text-[13px] mt-1"
                >
                  Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="h-4" />
    </div>
  );
}
