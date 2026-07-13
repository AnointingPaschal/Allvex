import { useState } from "react";
import { useParams } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import VehicleArt from "../components/VehicleArt.jsx";
import StageTimeline from "../components/StageTimeline.jsx";
import { garageVehicles } from "../data/mock.js";
import {
  Gauge, ShieldCheck, FileText, Wallet, Clock, Plus, Droplet, Wrench,
  SprayCan, Disc, X, Calendar, MoreHorizontal, Upload,
} from "lucide-react";

const tabs = ["Overview", "Maintenance", "Documents", "Expenses", "Timeline"];

const defaultTasks = [
  { id: 1, icon: Droplet, name: "Oil Change", every: "Every 5,000 km or 3 months", due: "In 8 days", level: "upcoming" },
  { id: 2, icon: Disc, name: "Brake Inspection", every: "Every 10,000 km", due: "Overdue by 3 days", level: "overdue" },
  { id: 3, icon: SprayCan, name: "Car Wash", every: "Every 2 weeks", due: "In 2 days", level: "upcoming" },
  { id: 4, icon: Wrench, name: "Full Service", every: "Every 6 months", due: "In 41 days", level: "scheduled" },
];

const levelStyles = {
  upcoming: "bg-blue-50 text-electric",
  overdue: "bg-red-50 text-danger",
  scheduled: "bg-slate-100 text-slate-500",
};

const timelineEvents = [
  { label: "Vehicle Registered in Garage", done: true, date: "Mar 02, 2025" },
  { label: "Oil Changed · 5,000 km", done: true, date: "May 14, 2025" },
  { label: "Dashcam Installed", done: true, date: "Jun 01, 2025" },
  { label: "Insurance Renewed", done: true, current: true, date: "Jul 13, 2026" },
  { label: "Next: Oil Change Due", done: false, date: "Est. Jul 21, 2026" },
];

const documents = [
  { name: "Vehicle Registration", type: "PDF" },
  { name: "Insurance Certificate", type: "PDF" },
  { name: "Purchase Invoice", type: "PDF" },
  { name: "Import Inspection Report", type: "PDF" },
  { name: "Warranty Document", type: "PDF" },
];

export default function GarageVehicle() {
  const { id } = useParams();
  const v = garageVehicles.find((x) => x.id === id) || garageVehicles[0];
  const [tab, setTab] = useState("Overview");
  const [showAdd, setShowAdd] = useState(false);
  const [tasks, setTasks] = useState(defaultTasks);

  return (
    <div className="pb-10">
      <TopBar title={v.nickname} right={<MoreHorizontal size={19} className="text-midnight" />} />

      <VehicleArt category={v.brand === "BYD" ? "Electric" : "SUV"} className="h-40 w-full" iconSize={40} />

      <div className="px-5">
        <div className="flex items-start justify-between mt-4">
          <div>
            <p className="text-[17px] font-bold text-midnight">{v.brand} {v.model}</p>
            <p className="text-[12.5px] text-slate-400 mt-0.5">{v.year} · {v.color} · {v.plate}</p>
          </div>
          <div className="text-right">
            <p className="text-[17px] font-bold text-success">{v.health}%</p>
            <p className="text-[10.5px] text-slate-400">Health Score</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 -mx-5 px-5">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`tap shrink-0 px-4 py-2 rounded-pill text-[12.5px] font-semibold ${
                tab === t ? "bg-midnight text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {tab === "Overview" && (
            <div className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                <Stat icon={Gauge} label="Mileage" value={`${v.mileage.toLocaleString()} km`} />
                <Stat icon={ShieldCheck} label="Insurance" value={v.insurance} />
              </div>
              <div className="bg-white rounded-allvex shadow-card p-4">
                <p className="text-[13px] font-semibold text-midnight mb-1">Next up</p>
                <p className="text-[12.5px] text-slate-400">{v.nextService}</p>
              </div>
              <button onClick={() => setTab("Maintenance")} className="tap w-full bg-electric/10 rounded-allvex p-4 text-left">
                <p className="text-[13px] font-semibold text-electric">Set a routine reminder</p>
                <p className="text-[11.5px] text-slate-500 mt-0.5">Oil change, servicing, wash & more — never miss a task.</p>
              </button>
            </div>
          )}

          {tab === "Maintenance" && (
            <div className="flex flex-col gap-3">
              <button onClick={() => setShowAdd(true)} className="tap w-full flex items-center justify-center gap-2 bg-midnight text-white rounded-allvex py-3.5 font-semibold text-[13.5px]">
                <Plus size={16} /> Add Routine Task
              </button>
              {tasks.map((t) => (
                <div key={t.id} className="bg-white rounded-allvex shadow-card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-electric/10 flex items-center justify-center shrink-0">
                    <t.icon size={17} className="text-electric" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold text-midnight">{t.name}</p>
                    <p className="text-[11.5px] text-slate-400 mt-0.5">{t.every}</p>
                  </div>
                  <span className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-pill shrink-0 ${levelStyles[t.level]}`}>{t.due}</span>
                </div>
              ))}
              <p className="text-[11.5px] text-slate-400 text-center mt-1">
                Allvex tracks these by date or mileage and notifies you when a task is due.
              </p>
            </div>
          )}

          {tab === "Documents" && (
            <div className="flex flex-col gap-3">
              <button className="tap w-full flex items-center justify-center gap-2 bg-midnight text-white rounded-allvex py-3.5 font-semibold text-[13.5px]">
                <Upload size={16} /> Upload Document
              </button>
              {documents.map((d) => (
                <div key={d.name} className="bg-white rounded-allvex shadow-card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <FileText size={17} className="text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-midnight truncate">{d.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{d.type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "Expenses" && (
            <div className="flex flex-col gap-3.5">
              <div className="bg-midnight rounded-allvex p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-400">Total ownership cost</p>
                  <p className="text-[19px] font-bold text-white">₦412,500</p>
                </div>
                <Wallet size={22} className="text-electric" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Stat icon={Wallet} label="Avg / month" value="₦34,375" />
                <Stat icon={Droplet} label="Fuel / charging" value="₦140,200" />
              </div>
            </div>
          )}

          {tab === "Timeline" && (
            <div className="bg-white rounded-allvex shadow-card p-5">
              <StageTimeline stages={timelineEvents} />
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50 max-w-[430px] mx-auto" onClick={() => setShowAdd(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full rounded-t-[28px] p-6 pb-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-bold text-midnight">Add Routine Task</h3>
              <button onClick={() => setShowAdd(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="flex flex-col gap-3">
              <input placeholder="Task name (e.g. Tyre Rotation)" className="bg-slate-50 border border-slate-100 rounded-allvex px-4 py-3 text-[13.5px] outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Every (km)" className="bg-slate-50 border border-slate-100 rounded-allvex px-4 py-3 text-[13.5px] outline-none" />
                <input placeholder="Every (months)" className="bg-slate-50 border border-slate-100 rounded-allvex px-4 py-3 text-[13.5px] outline-none" />
              </div>
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-allvex px-4 py-3">
                <Calendar size={16} className="text-slate-400" />
                <span className="text-[13.5px] text-slate-400">Start date</span>
              </div>
              <p className="text-[11.5px] text-slate-400 -mt-1">We'll notify you by whichever comes first — date or mileage.</p>
              <button
                onClick={() => setShowAdd(false)}
                className="tap w-full py-3.5 rounded-allvex bg-electric text-white font-semibold text-[14.5px] mt-2"
              >
                Save Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-allvex shadow-card p-3.5 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-electric/10 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-electric" />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-midnight truncate">{value}</p>
        <p className="text-[10.5px] text-slate-400">{label}</p>
      </div>
    </div>
  );
}
