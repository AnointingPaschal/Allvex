/**
 * ALLVEX — OBD-II DIAGNOSTIC CODE DATABASE
 * 80+ codes covering Powertrain, Body, Chassis, Network systems.
 * Used for: AI system prompt training + in-app code lookup browser.
 */
export const obdCodes = [
  // ── POWERTRAIN — Air/Fuel ─────────────────────────────────────────────────
  { code:"P0101", system:"P", subsystem:"MAF/Airflow", name:"MAF Sensor Circuit Range/Performance", severity:"medium",
    symptoms:"Poor fuel economy, rough idle, engine hesitation on acceleration, black smoke.",
    causes:"Dirty or contaminated MAF sensor, air filter clog, cracked intake boot.",
    fixes:"Clean MAF sensor with MAF cleaner spray, replace air filter, inspect intake boot." },

  { code:"P0102", system:"P", subsystem:"MAF/Airflow", name:"MAF Sensor Circuit Low Input", severity:"medium",
    symptoms:"Engine stalls, very rough idle, extremely poor power.",
    causes:"Disconnected MAF sensor, broken wiring, failed MAF sensor.",
    fixes:"Check MAF connector, inspect wiring harness, replace MAF sensor." },

  { code:"P0171", system:"P", subsystem:"Fuel", name:"System Too Lean (Bank 1)", severity:"medium",
    symptoms:"Hesitation on acceleration, lack of power, engine pinging, rough idle.",
    causes:"Vacuum leak, dirty MAF sensor, weak fuel pump, clogged fuel injectors.",
    fixes:"Smoke test for vacuum leaks, clean MAF sensor, test fuel pressure, clean injectors." },

  { code:"P0172", system:"P", subsystem:"Fuel", name:"System Too Rich (Bank 1)", severity:"medium",
    symptoms:"Black exhaust smoke, strong fuel smell, poor gas mileage, fouled spark plugs.",
    causes:"Leaking fuel injector, faulty O2 sensor, bad fuel pressure regulator, coolant temp sensor.",
    fixes:"Replace leaking injector, swap O2 sensor, replace fuel pressure regulator." },

  { code:"P0174", system:"P", subsystem:"Fuel", name:"System Too Lean (Bank 2)", severity:"medium",
    symptoms:"Same as P0171 but on the second bank of cylinders on V-engines.",
    causes:"Vacuum leak on the Bank 2 side, MAF sensor, fuel delivery.",
    fixes:"Smoke test Bank 2 intake, clean MAF, test fuel pressure." },

  { code:"P0175", system:"P", subsystem:"Fuel", name:"System Too Rich (Bank 2)", severity:"medium",
    symptoms:"Rich condition on the secondary cylinder bank.",
    causes:"Injector leak, O2 sensor failure on Bank 2.",
    fixes:"Inspect Bank 2 injectors and O2 sensors." },

  { code:"P0191", system:"P", subsystem:"Fuel", name:"Fuel Rail Pressure Sensor Performance", severity:"high",
    symptoms:"Hard start, stalling, erratic idle, poor acceleration.",
    causes:"Failing fuel rail pressure sensor, fuel pressure regulator issue, low fuel.",
    fixes:"Replace fuel rail pressure sensor, test fuel pump output." },

  // ── POWERTRAIN — Ignition/Misfires ───────────────────────────────────────
  { code:"P0300", system:"P", subsystem:"Ignition", name:"Random/Multiple Cylinder Misfire Detected", severity:"high",
    symptoms:"Engine shaking/vibrating, flashing check engine light, sluggish acceleration, smell of raw fuel.",
    causes:"Worn spark plugs, failing ignition coils, vacuum leak, low compression, bad fuel injectors.",
    fixes:"Replace spark plugs and coils, check for vacuum leaks, perform compression test." },

  { code:"P0301", system:"P", subsystem:"Ignition", name:"Cylinder 1 Misfire Detected", severity:"high",
    symptoms:"Rough idle, vibration at specific RPM, power loss on cylinder 1.",
    causes:"Bad spark plug #1, failed coil pack #1, injector fault #1, low compression #1.",
    fixes:"Swap spark plug and coil from another cylinder, do injector balance test, compression test." },

  { code:"P0302", system:"P", subsystem:"Ignition", name:"Cylinder 2 Misfire Detected", severity:"high",
    symptoms:"Same as P0301 but affecting cylinder 2.",
    causes:"Bad spark plug, coil, or injector on cylinder 2.",
    fixes:"Replace spark plug and coil on cylinder 2, check injector." },

  { code:"P0303", system:"P", subsystem:"Ignition", name:"Cylinder 3 Misfire Detected", severity:"high",
    symptoms:"Misfire on cylinder 3.",
    causes:"Spark plug, coil, injector or compression issue on cylinder 3.",
    fixes:"Replace ignition components on cylinder 3, perform compression test." },

  { code:"P0304", system:"P", subsystem:"Ignition", name:"Cylinder 4 Misfire Detected", severity:"high",
    symptoms:"Misfire on cylinder 4.",
    causes:"Ignition or fuel delivery fault on cylinder 4.",
    fixes:"Replace spark plug and coil on cylinder 4." },

  { code:"P0316", system:"P", subsystem:"Ignition", name:"Misfire Detected on Engine Startup (First 1000 Revs)", severity:"medium",
    symptoms:"Rough start, shaking immediately after cranking.",
    causes:"Cold start injector issue, worn spark plugs, low compression.",
    fixes:"Check cold start injector, replace spark plugs, compression test." },

  // ── POWERTRAIN — Camshaft/VVT ─────────────────────────────────────────────
  { code:"P0011", system:"P", subsystem:"VVT", name:"Camshaft Position Timing Over-Advanced (Bank 1)", severity:"medium",
    symptoms:"Rough idle, engine stalling, reduced fuel economy, poor low-end power.",
    causes:"Dirty engine oil (wrong viscosity), failing VVT solenoid, stretched timing chain.",
    fixes:"Change oil and filter with correct viscosity, replace VVT solenoid, replace timing chain." },

  { code:"P0021", system:"P", subsystem:"VVT", name:"Camshaft Position Timing Over-Advanced (Bank 2)", severity:"medium",
    symptoms:"Same as P0011 on Bank 2 of a V-type engine.",
    causes:"Oil sludge in VVT system, solenoid failure on Bank 2.",
    fixes:"Oil change, replace Bank 2 VVT solenoid." },

  { code:"P0014", system:"P", subsystem:"VVT", name:"Camshaft Position Timing Over-Retarded (Bank 1)", severity:"medium",
    symptoms:"Rough idle, hard start when warm, reduced top-end power.",
    causes:"VVT solenoid stuck open, oil sludge, worn cam phaser.",
    fixes:"Clean or replace VVT solenoid, oil change, replace cam phaser." },

  // ── POWERTRAIN — Oxygen/Lambda Sensors ───────────────────────────────────
  { code:"P0130", system:"P", subsystem:"O2 Sensor", name:"O2 Sensor Circuit Malfunction (Bank 1 Sensor 1)", severity:"medium",
    symptoms:"Poor fuel economy, rough idle, failed emissions test.",
    causes:"Failed upstream O2 sensor, damaged wiring, exhaust leak near sensor.",
    fixes:"Replace upstream O2 sensor, check wiring and exhaust." },

  { code:"P0136", system:"P", subsystem:"O2 Sensor", name:"O2 Sensor Circuit Malfunction (Bank 1 Sensor 2)", severity:"medium",
    symptoms:"Poor fuel economy, catalytic converter issues.",
    causes:"Failed downstream O2 sensor, catalytic converter degradation.",
    fixes:"Replace downstream O2 sensor, test catalytic converter." },

  { code:"P0141", system:"P", subsystem:"O2 Sensor", name:"O2 Sensor Heater Circuit Malfunction (Bank 1 Sensor 2)", severity:"low",
    symptoms:"Slow fuel trim response in cold weather, slightly poor economy.",
    causes:"Failed O2 sensor heater element, blown fuse, wiring fault.",
    fixes:"Replace O2 sensor, check fuse and wiring." },

  // ── POWERTRAIN — Crankshaft/Camshaft Position ────────────────────────────
  { code:"P0335", system:"P", subsystem:"CPS", name:"Crankshaft Position Sensor 'A' Circuit Malfunction", severity:"critical",
    symptoms:"Hard start, engine cranks but will not start, or sudden stalling while driving.",
    causes:"Damaged crankshaft sensor, broken wiring harness, tone ring damage.",
    fixes:"Replace crankshaft position sensor, inspect wiring and tone ring." },

  { code:"P0340", system:"P", subsystem:"CPS", name:"Camshaft Position Sensor 'A' Circuit Malfunction (Bank 1)", severity:"high",
    symptoms:"No start, stalling, rough idle, poor performance.",
    causes:"Failed camshaft position sensor, damaged tone wheel, wiring issue.",
    fixes:"Replace camshaft position sensor, check wiring and reluctor ring." },

  { code:"P0345", system:"P", subsystem:"CPS", name:"Camshaft Position Sensor 'A' Circuit Malfunction (Bank 2)", severity:"high",
    symptoms:"No start or stalling on V-engine Bank 2.",
    causes:"CMP sensor failure on Bank 2.",
    fixes:"Replace Bank 2 camshaft position sensor." },

  // ── POWERTRAIN — Cooling System ───────────────────────────────────────────
  { code:"P0115", system:"P", subsystem:"Cooling", name:"Engine Coolant Temperature Circuit Malfunction", severity:"high",
    symptoms:"Engine runs rich when warm, electric fan runs constantly, no temperature gauge reading.",
    causes:"Failed ECT sensor, wiring damage, connector corrosion.",
    fixes:"Replace engine coolant temperature sensor, clean connector." },

  { code:"P0128", system:"P", subsystem:"Cooling", name:"Coolant Temperature Below Thermostat Regulating Temperature", severity:"medium",
    symptoms:"Heater takes very long to warm up, low temperature gauge reading, poor fuel economy.",
    causes:"Thermostat stuck open.",
    fixes:"Replace thermostat with correct specification." },

  { code:"P0217", system:"P", subsystem:"Cooling", name:"Engine Over Temperature Condition", severity:"critical",
    symptoms:"Temperature gauge in red zone, steam from engine bay. STOP DRIVING IMMEDIATELY.",
    causes:"Low coolant, blown head gasket, failed water pump, clogged radiator, broken fan.",
    fixes:"Check coolant level first. Diagnose root cause before driving." },

  // ── POWERTRAIN — Throttle/Idle ────────────────────────────────────────────
  { code:"P0507", system:"P", subsystem:"Idle", name:"Idle Air Control System RPM Higher Than Expected", severity:"medium",
    symptoms:"Engine idles faster than normal, requires more brake pressure at a stop.",
    causes:"Vacuum leak, dirty throttle body, failing Idle Air Control (IAC) valve.",
    fixes:"Clean throttle body, seal vacuum leaks, replace IAC valve." },

  { code:"P0506", system:"P", subsystem:"Idle", name:"Idle Air Control System RPM Lower Than Expected", severity:"medium",
    symptoms:"Rough idle, engine stalling at low speeds or when accessories are switched on.",
    causes:"Dirty throttle body, failing IAC valve, vacuum leak.",
    fixes:"Clean throttle body and IAC valve, check vacuum lines." },

  { code:"P0121", system:"P", subsystem:"Throttle", name:"Throttle Position Sensor Performance", severity:"high",
    symptoms:"Hesitation, stumbling on acceleration, erratic idle, sudden loss of power.",
    causes:"Worn TPS, dirty throttle body, poor TPS calibration.",
    fixes:"Replace throttle position sensor, clean throttle body." },

  { code:"P0122", system:"P", subsystem:"Throttle", name:"Throttle Position Sensor Circuit Low Input", severity:"high",
    symptoms:"Limp mode, car won't accelerate normally.",
    causes:"Failed TPS, broken wiring to TPS.",
    fixes:"Replace TPS, check wiring." },

  // ── POWERTRAIN — Emissions ────────────────────────────────────────────────
  { code:"P0401", system:"P", subsystem:"EGR", name:"EGR Flow Insufficient Detected", severity:"medium",
    symptoms:"Engine knocking/pinging on acceleration, failing emissions test.",
    causes:"Clogged EGR valve, blocked exhaust gas passages, failed EGR position sensor.",
    fixes:"Remove and physically clean the EGR valve and engine ports." },

  { code:"P0402", system:"P", subsystem:"EGR", name:"EGR Flow Excessive Detected", severity:"medium",
    symptoms:"Rough idle, stalling, excessive EGR flow flooding combustion.",
    causes:"EGR valve stuck open, EGR solenoid failed open.",
    fixes:"Replace EGR valve and solenoid." },

  { code:"P0420", system:"P", subsystem:"Catalyst", name:"Catalyst System Efficiency Below Threshold (Bank 1)", severity:"medium",
    symptoms:"Rotten egg smell from exhaust, poor acceleration, lack of top-end power, failed emissions test.",
    causes:"Failing catalytic converter, exhaust leak before cat, faulty downstream O2 sensor.",
    fixes:"Replace catalytic converter, weld exhaust leaks, replace downstream O2 sensor." },

  { code:"P0430", system:"P", subsystem:"Catalyst", name:"Catalyst System Efficiency Below Threshold (Bank 2)", severity:"medium",
    symptoms:"Same as P0420 on Bank 2.",
    causes:"Bank 2 catalytic converter failure.",
    fixes:"Replace Bank 2 catalytic converter, check O2 sensors." },

  { code:"P0455", system:"P", subsystem:"EVAP", name:"EVAP System Leak Detected (Gross/Large Leak)", severity:"low",
    symptoms:"Fuel smell near rear of vehicle, slightly decreased fuel economy, check engine light.",
    causes:"Loose or missing gas cap, cracked charcoal canister, torn EVAP hose, failed purge valve.",
    fixes:"Tighten/replace gas cap first. Smoke test EVAP system, replace purge valve or canister." },

  { code:"P0456", system:"P", subsystem:"EVAP", name:"EVAP System Leak Detected (Small Leak)", severity:"low",
    symptoms:"Faint fuel smell, check engine light. Similar to P0455 but smaller leak.",
    causes:"Hairline crack in EVAP hose, micro-leak at canister or gas cap.",
    fixes:"Smoke test EVAP system, inspect all hoses and connections." },

  { code:"P0440", system:"P", subsystem:"EVAP", name:"Evaporative Emission System Malfunction", severity:"low",
    symptoms:"Fuel odor, check engine light.",
    causes:"General EVAP system fault — purge valve, vent valve, or canister.",
    fixes:"Check all EVAP components, smoke test system." },

  { code:"P0442", system:"P", subsystem:"EVAP", name:"EVAP System Leak Detected (Small Leak)", severity:"low",
    symptoms:"Fuel smell, check engine light.",
    causes:"Loose gas cap, damaged EVAP lines.",
    fixes:"Replace gas cap, inspect EVAP lines." },

  // ── POWERTRAIN — Knock/Detonation ─────────────────────────────────────────
  { code:"P0325", system:"P", subsystem:"Knock", name:"Knock Sensor 1 Circuit Malfunction", severity:"medium",
    symptoms:"Pinging/knocking sound under load, reduced power, poor fuel economy (ECU retards timing).",
    causes:"Failed knock sensor, loose sensor, damaged wiring.",
    fixes:"Replace knock sensor, check mounting torque, inspect wiring." },

  { code:"P0332", system:"P", subsystem:"Knock", name:"Knock Sensor 2 Circuit Low Input (Bank 2)", severity:"medium",
    symptoms:"Same as P0325 on Bank 2.",
    causes:"Failed knock sensor on Bank 2.",
    fixes:"Replace Bank 2 knock sensor." },

  // ── POWERTRAIN — Fuel System ──────────────────────────────────────────────
  { code:"P0087", system:"P", subsystem:"Fuel Pressure", name:"Fuel Rail/System Pressure Too Low", severity:"high",
    symptoms:"Hard start, loss of power, hesitation, engine stalling at high loads.",
    causes:"Weak fuel pump, clogged fuel filter, failing fuel pressure regulator, clogged injectors.",
    fixes:"Test fuel pressure (spec varies by car), replace fuel filter, replace fuel pump." },

  { code:"P0089", system:"P", subsystem:"Fuel Pressure", name:"Fuel Pressure Regulator Performance", severity:"high",
    symptoms:"Rough idle, hard start, black smoke, poor fuel economy.",
    causes:"Failed fuel pressure regulator allowing fuel pressure to fluctuate.",
    fixes:"Replace fuel pressure regulator." },

  { code:"P0200", system:"P", subsystem:"Fuel Injectors", name:"Fuel Injector Circuit Open", severity:"high",
    symptoms:"Cylinder misfire, rough idle, poor power.",
    causes:"Failed fuel injector, broken injector wiring or connector.",
    fixes:"Test injector resistance, replace failed injector, repair wiring." },

  // ── POWERTRAIN — Transmission ─────────────────────────────────────────────
  { code:"P0700", system:"P", subsystem:"Transmission", name:"Transmission Control System (MIL Request)", severity:"high",
    symptoms:"Harsh shifting, vehicle stuck in limp mode (won't shift past 2nd/3rd gear), transmission warning light.",
    causes:"General transmission fault — requires further scan of TCM for specific sub-code.",
    fixes:"Scan TCM with advanced scanner for sub-codes. Check transmission fluid level and condition." },

  { code:"P0715", system:"P", subsystem:"Transmission", name:"Input/Turbine Speed Sensor Circuit Malfunction", severity:"high",
    symptoms:"Harsh shifting, transmission stuck in gear, erratic shifts.",
    causes:"Failed input speed sensor, damaged wiring, metal particles on sensor from worn transmission.",
    fixes:"Replace input speed sensor, check transmission condition." },

  { code:"P0730", system:"P", subsystem:"Transmission", name:"Incorrect Gear Ratio", severity:"high",
    symptoms:"Vehicle stuck in single gear, limp mode, poor fuel economy.",
    causes:"Slipping clutch pack, failed solenoid, low transmission fluid, worn gears.",
    fixes:"Check fluid level and condition, service transmission, solenoid replacement." },

  { code:"P0741", system:"P", subsystem:"Transmission", name:"Torque Converter Clutch Circuit Performance/Stuck Off", severity:"medium",
    symptoms:"Poor fuel economy on highway, RPM surges at highway speed, no lockup feel.",
    causes:"Failed torque converter clutch solenoid, dirty transmission fluid, worn TCC.",
    fixes:"Replace TCC solenoid, service transmission fluid, rebuild/replace torque converter." },

  { code:"P0720", system:"P", subsystem:"Transmission", name:"Output Speed Sensor Circuit Malfunction", severity:"high",
    symptoms:"Transmission won't shift, erratic speedometer, ABS light may trigger.",
    causes:"Failed output speed sensor, damaged tone wheel.",
    fixes:"Replace output speed sensor." },

  // ── BODY ──────────────────────────────────────────────────────────────────
  { code:"B0001", system:"B", subsystem:"Airbag", name:"Driver's Airbag Squib 1 Circuit Open", severity:"critical",
    symptoms:"Airbag/SRS warning light on. Airbag may not deploy in accident.",
    causes:"Damaged clock spring, loose connector, failed airbag module.",
    fixes:"Do NOT attempt DIY repair. Take to qualified technician immediately." },

  { code:"B0020", system:"B", subsystem:"Airbag", name:"Passenger Airbag Deployment Control Fault", severity:"critical",
    symptoms:"SRS light on. Passenger airbag may not deploy correctly.",
    causes:"Failed passenger airbag module or connector.",
    fixes:"Professional repair required. Do not ignore this fault." },

  { code:"B0101", system:"B", subsystem:"Climate", name:"Outside Air Temperature Sensor Circuit Fault", severity:"low",
    symptoms:"Incorrect outside temp display, automatic climate control behaves erratically.",
    causes:"Failed ambient air temp sensor (usually in front bumper area).",
    fixes:"Replace ambient air temperature sensor." },

  // ── CHASSIS ───────────────────────────────────────────────────────────────
  { code:"C0031", system:"C", subsystem:"ABS", name:"Right Front Wheel Speed Sensor Input Circuit Range/Performance", severity:"high",
    symptoms:"ABS and traction control lights on, ABS may not function properly in emergency braking.",
    causes:"Failed wheel speed sensor, damaged tone ring, damaged wiring.",
    fixes:"Replace wheel speed sensor, inspect tone ring for damage." },

  { code:"C0035", system:"C", subsystem:"ABS", name:"Left Front Wheel Speed Sensor Input Circuit Fault", severity:"high",
    symptoms:"ABS and stability control warning lights on.",
    causes:"Failed left front wheel speed sensor, corroded connector.",
    fixes:"Replace left front wheel speed sensor." },

  { code:"C0040", system:"C", subsystem:"ABS", name:"Right Rear Wheel Speed Sensor Input Circuit Fault", severity:"high",
    symptoms:"ABS light on, possible speedometer error.",
    causes:"Failed right rear wheel speed sensor.",
    fixes:"Replace right rear wheel speed sensor." },

  { code:"C0044", system:"C", subsystem:"ABS", name:"Left Rear Wheel Speed Sensor Input Circuit Fault", severity:"high",
    symptoms:"ABS and traction control disabled.",
    causes:"Failed left rear wheel speed sensor.",
    fixes:"Replace left rear wheel speed sensor." },

  { code:"C0265", system:"C", subsystem:"ABS", name:"ABS Actuator Relay Circuit Open", severity:"high",
    symptoms:"ABS light on, ABS module not powering properly.",
    causes:"Blown fuse, failed ABS relay, damaged wiring to ABS module.",
    fixes:"Check ABS fuse, replace ABS relay, inspect wiring." },

  { code:"C0550", system:"C", subsystem:"Steering", name:"Electronic Control Unit Performance", severity:"high",
    symptoms:"Power steering warning light, heavy steering (electric power steering failure).",
    causes:"Failed EPS control module, low battery voltage affecting EPS.",
    fixes:"Check battery and charging system, replace EPS module." },

  // ── NETWORK ───────────────────────────────────────────────────────────────
  { code:"U0001", system:"U", subsystem:"CAN Bus", name:"High Speed CAN Communication Bus Fault", severity:"high",
    symptoms:"Multiple warning lights simultaneously, various modules not communicating.",
    causes:"Damaged CAN bus wiring, failed module dragging down the bus, water intrusion.",
    fixes:"Scan all modules, check for damaged CAN wiring, isolate faulty module." },

  { code:"U0100", system:"U", subsystem:"CAN Bus", name:"Lost Communication With ECM/PCM", severity:"critical",
    symptoms:"Car won't start, multiple systems offline, all warning lights on.",
    causes:"Failed ECM/PCM, lost power to ECM, CAN bus fault.",
    fixes:"Check ECM fuses and power supply, replace ECM/PCM if confirmed failed." },

  { code:"U0101", system:"U", subsystem:"CAN Bus", name:"Lost Communication With TCM", severity:"high",
    symptoms:"Transmission goes into limp mode, harsh shifting.",
    causes:"Failed TCM, lost power or ground to TCM, CAN bus wiring fault.",
    fixes:"Check TCM power and ground, inspect CAN bus wiring, replace TCM." },

  { code:"U0121", system:"U", subsystem:"CAN Bus", name:"Lost Communication With Anti-Lock Brake System (ABS) Control Module", severity:"high",
    symptoms:"ABS, traction control and stability control all disabled simultaneously.",
    causes:"Failed ABS module, CAN bus fault.",
    fixes:"Check ABS module power and ground, replace ABS module." },

  // ── HYBRID/ELECTRIC ───────────────────────────────────────────────────────
  { code:"P0A00", system:"P", subsystem:"HV Battery", name:"Drive Motor 'A' Performance", severity:"critical",
    symptoms:"Loss of electric drive, reduced power, warning lights on hybrid/EV.",
    causes:"Failed drive motor, motor control issue.",
    fixes:"Requires HV-trained technician. Do not attempt DIY." },

  { code:"P0A80", system:"P", subsystem:"HV Battery", name:"Replace Hybrid/EV Battery Pack", severity:"critical",
    symptoms:"Significant range reduction, battery warning, power limiting mode.",
    causes:"Degraded high-voltage battery cells reaching end of life.",
    fixes:"Battery reconditioning or replacement. Check warranty status — many EVs have 8yr/160,000km HV battery warranty." },

  { code:"P1A00", system:"P", subsystem:"HV Battery", name:"High Voltage Battery Pack Voltage Variance", severity:"high",
    symptoms:"Reduced range, power limitation, EV/hybrid warning light.",
    causes:"Cell imbalance in battery pack, degraded cell module.",
    fixes:"Battery module inspection and replacement by HV-certified technician." },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

export const systemLabels = {
  P: "Powertrain (Engine & Transmission)",
  B: "Body (Interior & Safety)",
  C: "Chassis (Brakes & Suspension)",
  U: "Network (Module Communication)",
};

export const severityConfig = {
  critical: { label: "Critical — Stop Driving", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  high:     { label: "High — Repair Soon",      color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  medium:   { label: "Medium — Monitor",         color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  low:      { label: "Low — Schedule Repair",   color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
};

export function findCode(query) {
  const q = query.trim().toUpperCase();
  return obdCodes.filter((c) =>
    c.code === q || c.code.includes(q) || c.name.toLowerCase().includes(query.toLowerCase())
  );
}

/** Returns a compact text summary of all codes for injection into the AI system prompt */
export function getOBDSummaryForAI() {
  return obdCodes.map((c) =>
    `${c.code} (${c.severity.toUpperCase()}) — ${c.name}: Symptoms: ${c.symptoms} Causes: ${c.causes} Fix: ${c.fixes}`
  ).join("\n");
}
