import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingCart, Package, MapPin, CreditCard, Check, Loader2, Trash2, Plus, Minus, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const STEPS = ["Cart", "Shipping", "Payment", "Confirmation"];

export default function Checkout() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { list, total, setQty, remove, clear } = useCart();
  const [step, setStep] = useState(0);
  const [settings, setSettings] = useState({});
  const [shipping, setShipping] = useState({ name: "", phone: "", address: "", city: "", state: "" });
  const [payMethod, setPayMethod] = useState("paystack");
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    supabase.from("platform_settings").select("key,value").then(({ data }) => {
      const obj = {};
      (data || []).forEach((r) => { obj[r.key] = r.value; });
      setSettings(obj);
      if (obj.payment_enabled_paystack !== "false") setPayMethod("paystack");
      else if (obj.payment_enabled_flutterwave !== "false") setPayMethod("flutterwave");
      else setPayMethod("manual");
    });
    if (profile) {
      setShipping((s) => ({ ...s, name: profile.full_name || "", phone: profile.phone || "" }));
    }
  }, [profile]);

  // ── Payment gateway helpers ──────────────────────────────────────────────

  function loadScript(src) {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      document.head.appendChild(s);
    });
  }

  async function payWithPaystack(ref) {
    await loadScript("https://js.paystack.co/v1/inline.js");
    return new Promise((resolve, reject) => {
      const handler = window.PaystackPop.setup({
        key: settings.paystack_public_key || "",
        email: profile?.email,
        amount: Math.round(total * 100), // kobo
        currency: "NGN",
        ref,
        callback: (response) => resolve(response.reference),
        onClose: () => reject(new Error("Payment cancelled")),
      });
      handler.openIframe();
    });
  }

  async function payWithFlutterwave(ref) {
    await loadScript("https://checkout.flutterwave.com/v3.js");
    return new Promise((resolve, reject) => {
      window.FlutterwaveCheckout({
        public_key: settings.flutterwave_public_key || "",
        tx_ref: ref,
        amount: total,
        currency: "NGN",
        payment_options: "card,ussd,bank_transfer",
        customer: { email: profile?.email, name: profile?.full_name, phonenumber: shipping.phone },
        customizations: { title: "Allvex Accessories", description: "Checkout", logo: "" },
        callback: (data) => { if (data.status === "successful") resolve(data.transaction_id); else reject(new Error("Payment failed")); },
        onclose: () => reject(new Error("Payment cancelled")),
      });
    });
  }

  async function placeOrder(payRef = null) {
    setPlacing(true);
    const { data: order, error } = await supabase.from("accessory_orders").insert({
      customer_id: profile.id,
      total,
      status: payMethod === "manual" ? "awaiting_payment" : "placed",
      shipping_name: shipping.name,
      shipping_phone: shipping.phone,
      shipping_address: shipping.address,
      shipping_city: shipping.city,
      shipping_state: shipping.state,
      payment_method: payMethod,
      payment_reference: payRef,
    }).select().single();

    if (error || !order) { setPlacing(false); return; }

    await supabase.from("accessory_order_items").insert(
      list.map((i) => ({ order_id: order.id, accessory_id: i.product.id, quantity: i.qty, unit_price: i.product.price }))
    );

    setOrderId(order.id);
    clear();
    setPlacing(false);
    setStep(3);
  }

  async function handlePayment() {
    const ref = `allvex_${Date.now()}`;
    if (payMethod === "manual") { await placeOrder(null); return; }
    try {
      const payRef = payMethod === "paystack" ? await payWithPaystack(ref) : await payWithFlutterwave(ref);
      await placeOrder(payRef);
    } catch (e) {
      if (e.message !== "Payment cancelled") console.error(e);
    }
  }

  const canProceedToShipping = list.length > 0;
  const canProceedToPayment = shipping.name && shipping.phone && shipping.address && shipping.city && shipping.state;

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          {step < 3 && (
            <button onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}
              className="tap w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <ChevronLeft size={17} className="text-midnight" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-[15px] font-bold text-midnight">{STEPS[step]}</h1>
          </div>
          {/* Step dots */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i <= step ? "bg-electric" : "bg-slate-200"} ${i === step ? "w-5" : "w-1.5"}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 space-y-4">

        {/* ── Step 0: Cart ── */}
        {step === 0 && (
          <>
            {list.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-card p-8 text-center">
                <ShoppingCart size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-[14px] font-semibold text-midnight">Your cart is empty</p>
                <button onClick={() => navigate("/marketplace")}
                  className="tap mt-4 px-5 py-2.5 rounded-xl bg-electric text-white text-[13px] font-semibold">
                  Shop Accessories
                </button>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl shadow-card divide-y divide-slate-50">
                  {list.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 px-4 py-3.5">
                      {item.product.image_url
                        ? <img src={item.product.image_url} alt={item.product.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                        : <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0"><Package size={18} className="text-slate-300" /></div>}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-midnight truncate">{item.product.name}</p>
                        <p className="text-[12px] font-bold text-electric mt-0.5">₦{Number(item.product.price).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 shrink-0">
                        <button onClick={() => setQty(item.product.id, item.qty - 1)} className="tap w-6 h-6 rounded-md flex items-center justify-center"><Minus size={11} className="text-midnight" /></button>
                        <span className="w-6 text-center text-[12px] font-bold">{item.qty}</span>
                        <button onClick={() => setQty(item.product.id, item.qty + 1)} className="tap w-6 h-6 rounded-md flex items-center justify-center"><Plus size={11} className="text-midnight" /></button>
                      </div>
                      <button onClick={() => remove(item.product.id)} className="tap w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center shrink-0 ml-1">
                        <Trash2 size={13} className="text-danger" />
                      </button>
                    </div>
                  ))}
                </div>
                <OrderSummary total={total} />
                <Cta label={`Proceed to Shipping`} onClick={() => setStep(1)} disabled={!canProceedToShipping} />
              </>
            )}
          </>
        )}

        {/* ── Step 1: Shipping ── */}
        {step === 1 && (
          <>
            <div className="bg-white rounded-2xl shadow-card p-5 space-y-3">
              <h2 className="text-[14px] font-bold text-midnight flex items-center gap-2"><MapPin size={15} className="text-electric" /> Delivery Details</h2>
              <div className="space-y-2.5">
                <TwoCol>
                  <ShipField label="Full Name" value={shipping.name} onChange={(v) => setShipping((s) => ({ ...s, name: v }))} placeholder="As on ID" />
                  <ShipField label="Phone" value={shipping.phone} onChange={(v) => setShipping((s) => ({ ...s, phone: v }))} placeholder="+234 800…" />
                </TwoCol>
                <ShipField label="Street Address" value={shipping.address} onChange={(v) => setShipping((s) => ({ ...s, address: v }))} placeholder="House / street / area" />
                <TwoCol>
                  <ShipField label="City" value={shipping.city} onChange={(v) => setShipping((s) => ({ ...s, city: v }))} placeholder="Lagos" />
                  <ShipField label="State" value={shipping.state} onChange={(v) => setShipping((s) => ({ ...s, state: v }))} placeholder="Lagos State" />
                </TwoCol>
              </div>
            </div>
            <OrderSummary total={total} />
            <Cta label="Proceed to Payment" onClick={() => setStep(2)} disabled={!canProceedToPayment} />
          </>
        )}

        {/* ── Step 2: Payment ── */}
        {step === 2 && (
          <>
            <div className="bg-white rounded-2xl shadow-card p-5 space-y-3">
              <h2 className="text-[14px] font-bold text-midnight flex items-center gap-2"><CreditCard size={15} className="text-electric" /> Payment Method</h2>

              <div className="space-y-2">
                {settings.payment_enabled_paystack !== "false" && (
                  <PayOption
                    id="paystack" selected={payMethod === "paystack"} onSelect={() => setPayMethod("paystack")}
                    logo={<PaystackLogo />} label="Paystack" sub="Card, bank transfer, USSD, mobile money"
                  />
                )}
                {settings.payment_enabled_flutterwave !== "false" && (
                  <PayOption
                    id="flutterwave" selected={payMethod === "flutterwave"} onSelect={() => setPayMethod("flutterwave")}
                    logo={<FlwLogo />} label="Flutterwave" sub="Card, bank transfer, USSD & more"
                  />
                )}
                {settings.payment_enabled_manual !== "false" && (
                  <PayOption
                    id="manual" selected={payMethod === "manual"} onSelect={() => setPayMethod("manual")}
                    logo={<div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center"><CreditCard size={16} className="text-slate-500" /></div>}
                    label="Bank Transfer" sub="Manual payment to Allvex account"
                  />
                )}
              </div>

              {payMethod === "manual" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                  <p className="text-[12px] font-bold text-warning">Transfer to this account</p>
                  <div className="space-y-1">
                    <BankRow label="Bank" value={settings.manual_bank_name} />
                    <BankRow label="Account Number" value={settings.manual_account_number} copyable />
                    <BankRow label="Account Name" value={settings.manual_account_name} />
                    <BankRow label="Amount" value={`₦${total.toLocaleString()}`} />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Send payment first, then click "Place Order". Your order will be confirmed once payment is verified by our team (1–2 hours on business days).
                  </p>
                </div>
              )}

              {(!settings.paystack_public_key && payMethod === "paystack") || (!settings.flutterwave_public_key && payMethod === "flutterwave") ? (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                  <AlertCircle size={14} className="text-warning shrink-0 mt-0.5" />
                  <p className="text-[11.5px] text-slate-600">Payment gateway keys aren't configured yet. An admin must add them in Settings → Payment.</p>
                </div>
              ) : null}
            </div>

            <OrderSummary total={total} />

            <button onClick={handlePayment} disabled={placing}
              className="tap w-full py-4 rounded-2xl bg-electric text-white font-bold text-[14.5px] flex items-center justify-center gap-2 disabled:opacity-60">
              {placing ? <><Loader2 size={16} className="animate-spin" /> Processing…</> : payMethod === "manual" ? "Place Order (Pay Later)" : `Pay ₦${total.toLocaleString()}`}
            </button>
          </>
        )}

        {/* ── Step 3: Confirmation ── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-card p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <Check size={28} className="text-success" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[18px] font-bold text-midnight">Order Placed!</p>
              <p className="text-[13px] text-slate-400 mt-1">
                {payMethod === "manual"
                  ? "Your order is awaiting payment confirmation. Transfer to the account provided and we'll confirm within 1–2 business hours."
                  : "Your payment was successful and your order is confirmed."}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl px-4 py-3 text-left space-y-1.5">
              <DetailRow label="Deliver to" value={`${shipping.name}, ${shipping.address}, ${shipping.city}, ${shipping.state}`} />
              <DetailRow label="Payment" value={payMethod === "manual" ? "Bank Transfer" : payMethod === "paystack" ? "Paystack" : "Flutterwave"} />
            </div>
            <div className="flex gap-2.5 pt-2">
              <button onClick={() => navigate("/profile")} className="tap flex-1 py-3 rounded-xl bg-slate-100 text-midnight font-semibold text-[13px]">My Orders</button>
              <button onClick={() => navigate("/marketplace")} className="tap flex-1 py-3 rounded-xl bg-electric text-white font-semibold text-[13px]">Keep Shopping</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function OrderSummary({ total }) {
  const delivery = total > 50000 ? 0 : 2500;
  return (
    <div className="bg-white rounded-2xl shadow-card p-4 space-y-2">
      <h3 className="text-[13px] font-bold text-midnight">Order Summary</h3>
      <div className="flex justify-between text-[12.5px] text-slate-500">
        <span>Subtotal</span><span>₦{total.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-[12.5px] text-slate-500">
        <span>Delivery</span>
        <span>{delivery === 0 ? <span className="text-success font-semibold">Free</span> : `₦${delivery.toLocaleString()}`}</span>
      </div>
      <div className="border-t border-slate-100 pt-2 flex justify-between text-[14px] font-bold text-midnight">
        <span>Total</span><span>₦{(total + delivery).toLocaleString()}</span>
      </div>
    </div>
  );
}

function Cta({ label, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="tap w-full py-4 rounded-2xl bg-electric text-white font-bold text-[14.5px] flex items-center justify-center gap-2 disabled:opacity-50">
      {label} <ChevronRight size={17} />
    </button>
  );
}

function ShipField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-slate-400 block mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-electric transition" />
    </div>
  );
}

function TwoCol({ children }) {
  return <div className="grid grid-cols-2 gap-2.5">{children}</div>;
}

function PayOption({ id, selected, onSelect, logo, label, sub }) {
  return (
    <button onClick={onSelect}
      className={`tap w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition ${selected ? "border-electric bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
      <div className="shrink-0">{logo}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-midnight">{label}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
      </div>
      <div className={`w-4.5 h-4.5 rounded-full border-2 shrink-0 flex items-center justify-center ${selected ? "border-electric bg-electric" : "border-slate-300"}`}
        style={{ width: 18, height: 18 }}>
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </button>
  );
}

function BankRow({ label, value, copyable }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11.5px] text-slate-400">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[12px] font-semibold text-midnight">{value || "—"}</span>
        {copyable && (
          <button onClick={copy} className="text-[10px] font-semibold text-electric bg-white px-1.5 py-0.5 rounded">
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[11.5px] text-slate-400 shrink-0">{label}</span>
      <span className="text-[12px] font-medium text-midnight text-right">{value}</span>
    </div>
  );
}

function PaystackLogo() {
  return (
    <div className="w-9 h-9 rounded-lg bg-[#0BA4DB]/10 flex items-center justify-center">
      <svg width="22" height="22" viewBox="0 0 100 100"><rect width="100" height="100" rx="16" fill="#0BA4DB"/><rect x="20" y="35" width="60" height="12" rx="6" fill="white"/><rect x="20" y="53" width="60" height="12" rx="6" fill="white" opacity="0.6"/></svg>
    </div>
  );
}

function FlwLogo() {
  return (
    <div className="w-9 h-9 rounded-lg bg-[#F5A623]/10 flex items-center justify-center">
      <svg width="22" height="22" viewBox="0 0 100 100"><rect width="100" height="100" rx="16" fill="#F5A623"/><path d="M25 65 L40 35 L55 55 L70 35 L75 65" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
  );
}
