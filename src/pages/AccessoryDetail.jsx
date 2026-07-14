import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Star, ShoppingCart, Plus, Minus, Check, Share2, Heart, ChevronRight, Package } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { useCart } from "../context/CartContext.jsx";
import { Loader2 } from "lucide-react";

export default function AccessoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add, items } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [pRes, rRes] = await Promise.all([
        supabase.from("accessories").select("*").eq("id", id).single(),
        supabase.from("accessories").select("*").neq("id", id).limit(4),
      ]);
      setProduct(pRes.data);
      setRelated(rRes.data || []);
      setLoading(false);
    }
    load();
  }, [id]);

  function addToCart() {
    for (let i = 0; i < qty; i++) add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const inCart = items[id]?.qty || 0;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 size={22} className="animate-spin text-electric" />
    </div>
  );
  if (!product) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-slate-400 text-[13px]">Product not found.</p>
    </div>
  );

  const gallery = [product.image_url, ...(product.gallery_urls || [])].filter(Boolean);

  return (
    <div className="pb-32">
      {/* Image gallery */}
      <div className="relative bg-slate-100">
        {gallery.length > 0 ? (
          <img src={gallery[activeImg]} alt={product.name} className="w-full h-64 sm:h-80 object-cover" />
        ) : (
          <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-midnight to-slate-700 flex items-center justify-center">
            <Package size={48} className="text-white/30" />
          </div>
        )}

        {/* Nav buttons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="tap w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
            <ChevronLeft size={18} className="text-midnight" />
          </button>
          <div className="flex gap-2">
            <button className="tap w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
              <Share2 size={15} className="text-midnight" />
            </button>
            <button className="tap w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
              <Heart size={15} className="text-midnight" />
            </button>
          </div>
        </div>

        {/* Image counter */}
        {gallery.length > 1 && (
          <span className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-pill">
            {activeImg + 1}/{gallery.length}
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 sm:px-6 py-2.5 bg-white">
          {gallery.map((url, i) => (
            <button key={i} onClick={() => setActiveImg(i)}
              className={`shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 ${i === activeImg ? "border-electric" : "border-transparent"}`}>
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-8 py-4 space-y-5">
        {/* Product header */}
        <div className="bg-white rounded-2xl shadow-card p-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-[18px] font-bold text-midnight leading-tight flex-1">{product.name}</h1>
            <div className="text-right shrink-0">
              <p className="text-[20px] font-black text-electric">₦{Number(product.price).toLocaleString()}</p>
              {product.stock > 0 ? (
                <span className="text-[11px] font-semibold text-success">{product.stock} in stock</span>
              ) : (
                <span className="text-[11px] font-semibold text-danger">Out of stock</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={13} className={s <= Math.round(product.rating) ? "text-warning fill-warning" : "text-slate-200 fill-slate-200"} />
              ))}
            </div>
            <span className="text-[12px] font-semibold text-midnight">{Number(product.rating).toFixed(1)}</span>
            <span className="text-[12px] text-slate-400">rating</span>
          </div>

          {/* Qty + add */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                <button onClick={() => setQty(Math.max(1, qty - 1))}
                  className="tap w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white transition">
                  <Minus size={14} className="text-midnight" />
                </button>
                <span className="w-8 text-center text-[14px] font-bold text-midnight">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="tap w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white transition">
                  <Plus size={14} className="text-midnight" />
                </button>
              </div>
              {inCart > 0 && (
                <span className="text-[11.5px] font-semibold text-electric bg-blue-50 px-3 py-1.5 rounded-pill">
                  {inCart} in cart
                </span>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <div className="bg-white rounded-2xl shadow-card p-4">
            <h2 className="text-[14px] font-bold text-midnight mb-2">About this product</h2>
            <p className="text-[13px] text-slate-500 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
        )}

        {/* Delivery info */}
        <div className="bg-white rounded-2xl shadow-card p-4 space-y-3">
          <h2 className="text-[14px] font-bold text-midnight">Delivery</h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
              <Package size={15} className="text-success" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-midnight">Lagos: 2–4 business days</p>
              <p className="text-[11.5px] text-slate-400">Other states: 5–10 business days</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-electric/10 flex items-center justify-center shrink-0">
              <Check size={15} className="text-electric" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-midnight">Genuine product guaranteed</p>
              <p className="text-[11.5px] text-slate-400">30-day returns · Allvex-verified</p>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <h2 className="text-[14px] font-bold text-midnight mb-3">You might also like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {related.map((r) => (
                <button key={r.id} onClick={() => navigate(`/accessories/${r.id}`)}
                  className="tap bg-white rounded-xl shadow-card overflow-hidden text-left">
                  {r.image_url
                    ? <img src={r.image_url} alt={r.name} className="h-20 w-full object-cover" />
                    : <div className="h-20 bg-slate-100 flex items-center justify-center"><Package size={20} className="text-slate-300" /></div>}
                  <div className="p-2.5">
                    <p className="text-[11.5px] font-semibold text-midnight truncate">{r.name}</p>
                    <p className="text-[11.5px] font-bold text-electric mt-0.5">₦{Number(r.price).toLocaleString()}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-3.5 z-40">
        <div className="max-w-lg mx-auto flex gap-2.5">
          <button
            onClick={() => navigate("/cart")}
            className="tap w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 relative"
          >
            <ShoppingCart size={18} className="text-midnight" />
            {(inCart > 0) && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-electric text-white text-[9px] font-bold flex items-center justify-center">
                {inCart}
              </span>
            )}
          </button>
          <button
            onClick={addToCart}
            disabled={product.stock === 0 || added}
            className={`tap flex-1 py-3 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition ${
              added ? "bg-success text-white" : product.stock === 0 ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-electric text-white hover:bg-blue-700"
            }`}
          >
            {added ? <><Check size={16} /> Added to Cart</> : <><ShoppingCart size={16} /> Add to Cart</>}
          </button>
        </div>
      </div>
    </div>
  );
}
