import { useState } from "react";
import DashboardLayout from "../DashboardLayout.jsx";
import { Badge, Panel, Table, Td, Button } from "../ui.jsx";
import { ClipboardList, History, Camera, X } from "lucide-react";
import { assignedInspections, completedInspections } from "../../data/portalMock.js";

const sections = [
  { key: "assigned", label: "Assigned Inspections", icon: ClipboardList },
  { key: "history", label: "History", icon: History },
];

const checklistItems = ["Exterior", "Interior", "Engine", "Battery", "Tyres", "Electronics", "Undercarriage", "Paint Thickness"];

export default function InspectorPortal() {
  const [active, setActive] = useState("assigned");
  const [inspecting, setInspecting] = useState(null);

  return (
    <DashboardLayout
      roleLabel="Inspector"
      roleColor="bg-success"
      sections={sections}
      active={active}
      onSelect={setActive}
      title={sections.find((s) => s.key === active).label}
      subtitle="Chinedu Obi · Lagos Port"
    >
      {active === "assigned" && (
        <Panel title="Assigned to You">
          <Table columns={["Vehicle", "VIN", "Location", "Due", ""]}>
            {assignedInspections.map((i) => (
              <tr key={i.id}>
                <Td bold>{i.vehicle}</Td>
                <Td>{i.vin}</Td>
                <Td>{i.location}</Td>
                <Td><Badge tone={i.due === "Today" ? "warning" : "neutral"}>{i.due}</Badge></Td>
                <Td><Button onClick={() => setInspecting(i)}>Start Inspection</Button></Td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}

      {active === "history" && (
        <Panel title="Completed Inspections">
          <Table columns={["Vehicle", "VIN", "Date", "Result"]}>
            {completedInspections.map((i) => (
              <tr key={i.id}>
                <Td bold>{i.vehicle}</Td>
                <Td>{i.vin}</Td>
                <Td>{i.date}</Td>
                <Td>
                  <Badge tone={i.result === "Passed" ? "success" : "warning"}>{i.result}</Badge>
                </Td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}

      {inspecting && <InspectionForm vehicle={inspecting} onClose={() => setInspecting(null)} />}
    </DashboardLayout>
  );
}

function InspectionForm({ vehicle, onClose }) {
  const [checked, setChecked] = useState({});
  const [result, setResult] = useState("Passed");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-allvex w-[520px] max-h-[85vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[16px] font-bold text-midnight">Inspection Report</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <p className="text-[12.5px] text-slate-400 mb-5">{vehicle.vehicle} · VIN {vehicle.vin}</p>

        <p className="text-[12.5px] font-semibold text-midnight mb-2.5">Checklist</p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {checklistItems.map((item) => (
            <label key={item} className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3.5 py-2.5">
              <input
                type="checkbox"
                className="accent-electric w-4 h-4"
                checked={!!checked[item]}
                onChange={(e) => setChecked((c) => ({ ...c, [item]: e.target.checked }))}
              />
              <span className="text-[12.5px] text-midnight">{item}</span>
            </label>
          ))}
        </div>

        <p className="text-[12.5px] font-semibold text-midnight mb-2.5">Media</p>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[1, 2, 3, 4].map((n) => (
            <button key={n} className="tap aspect-square rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
              <Camera size={18} />
            </button>
          ))}
        </div>

        <p className="text-[12.5px] font-semibold text-midnight mb-2.5">Inspector Notes</p>
        <textarea
          rows={3}
          placeholder="Add notes about condition, damage, or concerns..."
          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[13px] outline-none mb-5 resize-none"
        />

        <p className="text-[12.5px] font-semibold text-midnight mb-2.5">Result</p>
        <div className="flex gap-2 mb-6">
          {["Passed", "Minor Issues", "Not Recommended"].map((r) => (
            <button
              key={r}
              onClick={() => setResult(r)}
              className={`tap flex-1 py-2.5 rounded-xl text-[12px] font-semibold ${
                result === r ? "bg-midnight text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <Button className="w-full py-3" onClick={onClose}>Submit Report</Button>
      </div>
    </div>
  );
}
