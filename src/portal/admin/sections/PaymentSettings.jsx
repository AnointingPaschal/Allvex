import { useEffect, useState } from "react";
import { Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { SectionPanel, Field, Input, SaveBtn } from "../components/ui.jsx";
import { supabase } from "../../../lib/supabase.js";

export default function PaymentSettings({ toast }) {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKeys, setShowKeys] = useState({ paystack: false, flutterwave: false });

  async function load() {
    const { data } = await supabase.from("platform_settings").select("key,value");
    const obj = {};
    (data || []).forEach((r) => { obj[r.key] = r.value || ""; });
    setSettings(obj);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    const updates = Object.entries(settings).map(([key, value]) =>
      supabase.from("platform_settings").upsert({ key, value, updated_at: new Date().toISOString() })
    );
    await Promise.all(updates);
    setSaving(false);
    toast.success("Payment settings saved.");
  }

  function setS(key, value) { setSettings((s) => ({ ...s, [key]: value })); }

  if (loading) return <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-electric" /></div>;

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Gateway toggles */}
      <SectionPanel title="Active Payment Methods">
        <div className="divide-y divide-slate-100">
          <GatewayToggle label="Paystack" sub="Card, USSD, bank transfer" checked={settings.payment_enabled_paystack !== "false"} onChange={(v) => setS("payment_enabled_paystack", v ? "true" : "false")} />
          <GatewayToggle label="Flutterwave" sub="Card, mobile money, bank transfer" checked={settings.payment_enabled_flutterwave !== "false"} onChange={(v) => setS("payment_enabled_flutterwave", v ? "true" : "false")} />
          <GatewayToggle label="Manual Bank Transfer" sub="Customer pays directly and notifies team" checked={settings.payment_enabled_manual !== "false"} onChange={(v) => setS("payment_enabled_manual", v ? "true" : "false")} />
        </div>
      </SectionPanel>

      {/* Paystack config */}
      {settings.payment_enabled_paystack !== "false" && (
        <SectionPanel title="Paystack Configuration">
          <div className="p-5 space-y-3">
            <Field label="Public Key (starts with pk_)">
              <div className="relative">
                <input
                  type={showKeys.paystack ? "text" : "password"}
                  value={settings.paystack_public_key || ""}
                  onChange={(e) => setS("paystack_public_key", e.target.value)}
                  placeholder="pk_live_xxxxxxxxxxxxxx"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-electric pr-11"
                />
                <button type="button" onClick={() => setShowKeys((k) => ({ ...k, paystack: !k.paystack }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showKeys.paystack ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>
            <p className="text-[11.5px] text-slate-400">
              Get your public key from your Paystack dashboard under Settings → API Keys & Webhooks. Never paste your secret key here.
            </p>
          </div>
        </SectionPanel>
      )}

      {/* Flutterwave config */}
      {settings.payment_enabled_flutterwave !== "false" && (
        <SectionPanel title="Flutterwave Configuration">
          <div className="p-5 space-y-3">
            <Field label="Public Key (starts with FLWPUBK_)">
              <div className="relative">
                <input
                  type={showKeys.flutterwave ? "text" : "password"}
                  value={settings.flutterwave_public_key || ""}
                  onChange={(e) => setS("flutterwave_public_key", e.target.value)}
                  placeholder="FLWPUBK_TEST-xxxxxxxxxxxxxx-X"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-electric pr-11"
                />
                <button type="button" onClick={() => setShowKeys((k) => ({ ...k, flutterwave: !k.flutterwave }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showKeys.flutterwave ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>
            <p className="text-[11.5px] text-slate-400">
              Get your public key from your Flutterwave dashboard under Settings → API. Switch from test to live when ready.
            </p>
          </div>
        </SectionPanel>
      )}

      {/* Manual bank account */}
      {settings.payment_enabled_manual !== "false" && (
        <SectionPanel title="Bank Transfer Details">
          <div className="p-5 space-y-3">
            <Field label="Bank Name"><Input value={settings.manual_bank_name || ""} onChange={(e) => setS("manual_bank_name", e.target.value)} placeholder="e.g. First Bank Nigeria" /></Field>
            <Field label="Account Number"><Input value={settings.manual_account_number || ""} onChange={(e) => setS("manual_account_number", e.target.value)} placeholder="0123456789" /></Field>
            <Field label="Account Name"><Input value={settings.manual_account_name || ""} onChange={(e) => setS("manual_account_name", e.target.value)} placeholder="Allvex Automotive Ltd" /></Field>
            <p className="text-[11.5px] text-slate-400">
              These details are shown to customers who choose bank transfer at checkout.
            </p>
          </div>
        </SectionPanel>
      )}

      <SaveBtn saving={saving} label="Save Payment Settings" onClick={save} />
    </div>
  );
}

function GatewayToggle({ label, sub, checked, onChange }) {
  return (
    <label className="flex items-center justify-between px-5 py-4 cursor-pointer">
      <div>
        <p className="text-[13px] font-semibold text-midnight">{label}</p>
        <p className="text-[11.5px] text-slate-400 mt-0.5">{sub}</p>
      </div>
      <div onClick={() => onChange(!checked)}
        className={`relative shrink-0 rounded-full transition-colors cursor-pointer ${checked ? "bg-electric" : "bg-slate-200"}`}
        style={{ width: 44, height: 24 }}>
        <div className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-all ${checked ? "left-[23px]" : "left-[3px]"}`} />
      </div>
    </label>
  );
}
