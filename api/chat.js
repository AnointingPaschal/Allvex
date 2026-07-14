/**
 * Allvex AI Chat — Edge Function (Vercel)
 * Streams tokens from OpenRouter so the client can display them one by one.
 * Also injects the full OBD-II code database into the system prompt.
 */
export const config = { runtime: "edge" };

const OBD_KNOWLEDGE = `
You have expert knowledge of the following OBD-II diagnostic codes. When a user mentions a code (like P0420, P0300, etc.) or describes symptoms, use this database to give precise, actionable advice.

CRITICAL CODES (stop driving immediately): P0217 (overheating), B0001/B0020 (airbag), P0A00/P0A80 (HV battery), P0335 (no crank sensor).

CODE DATABASE:
P0011 — Cam Timing Over-Advanced B1: Rough idle, stalling, poor economy. Cause: dirty oil, VVT solenoid, timing chain. Fix: oil change, replace VVT solenoid.
P0014 — Cam Timing Over-Retarded B1: Hard warm start, poor top power. Cause: VVT solenoid stuck. Fix: replace solenoid, oil change.
P0021 — Cam Timing Over-Advanced B2: Same as P0011 on Bank 2.
P0087 — Fuel Pressure Too Low: Hard start, stalling, power loss. Cause: weak fuel pump, clogged filter. Fix: test fuel pressure, replace pump/filter.
P0089 — Fuel Pressure Regulator Performance: Rough idle, black smoke. Fix: replace regulator.
P0101 — MAF Sensor Range: Poor economy, rough idle, hesitation. Fix: clean MAF sensor, check air filter.
P0115 — Coolant Temp Sensor: Rich running, fan on constantly. Fix: replace ECT sensor.
P0121/P0122 — Throttle Position Sensor: Hesitation, limp mode. Fix: replace TPS.
P0128 — Coolant Below Thermostat Temp: Slow heat, low temp gauge. Fix: replace thermostat.
P0130/P0136 — O2 Sensor Circuit: Poor economy, emissions failure. Fix: replace O2 sensor.
P0171 — System Lean B1: Hesitation, pinging, power loss. Cause: vacuum leak, dirty MAF, weak fuel pump. Fix: smoke test, clean MAF.
P0172 — System Rich B1: Black smoke, fuel smell, bad mpg. Cause: leaking injector, bad O2 sensor. Fix: replace injector/O2.
P0174 — System Lean B2: Same as P0171 on Bank 2.
P0200 — Injector Circuit Open: Misfire, rough idle. Fix: test injectors, repair wiring.
P0217 — Engine OVERTEMPERATURE: STOP IMMEDIATELY. Cause: low coolant, blown head gasket, failed water pump, blocked radiator.
P0300 — Random Misfire: Shaking, flashing CEL, rough acceleration. Cause: plugs, coils, vacuum leak. Fix: replace plugs and coils.
P0301-P0308 — Cylinder N Misfire: Specific cylinder misfire. Fix: swap plug/coil to identify fault.
P0325/P0332 — Knock Sensor: Pinging under load, retarded timing, poor economy. Fix: replace knock sensor.
P0335 — Crankshaft Position Sensor: No start or sudden stall. Fix: replace CPS sensor, check wiring.
P0340/P0345 — Camshaft Position Sensor: No start, stalling. Fix: replace CMP sensor.
P0401 — EGR Flow Insufficient: Knocking, failed emissions. Fix: clean EGR valve.
P0420/P0430 — Catalyst Below Threshold: Rotten egg smell, poor power, failed emissions. Fix: replace catalytic converter.
P0440/P0442/P0455/P0456 — EVAP Leak: Fuel smell, CEL. Fix: check gas cap first, smoke test EVAP.
P0507 — Idle RPM High: Fast idle, brake required at stop. Fix: clean throttle body, check vacuum leaks.
P0700 — Transmission MIL: Harsh shifts, limp mode. Action: scan TCM for sub-codes, check trans fluid.
P0715/P0720 — Speed Sensor: Erratic shifts, wrong gear. Fix: replace speed sensor.
P0730 — Incorrect Gear Ratio: Limp mode, slipping. Cause: low fluid, clutch pack worn. Fix: service transmission.
P0741 — Torque Converter Clutch: Poor highway economy, RPM surges. Fix: replace TCC solenoid.
P0A80 — Replace HV Battery Pack: Range loss, power limiting. Fix: HV battery inspection/replacement by certified tech.
C0031/C0035/C0040/C0044 — Wheel Speed Sensor: ABS/traction control disabled. Fix: replace specific wheel speed sensor.
U0001 — CAN Bus High Speed Fault: Multiple warning lights. Fix: scan all modules, check CAN wiring.
U0100 — Lost Comm with ECM: No start, all lights on. Fix: check ECM power supply.

DIAGNOSTIC APPROACH: When a user gives a code, always state: 1) What it means in plain language, 2) Physical symptoms to expect, 3) Most likely cause (cheapest/easiest first), 4) Step-by-step diagnosis, 5) Urgency level. If a code is critical, warn them not to drive.
`;

const SYSTEM_PROMPT = `You are the Allvex AI Assistant — the expert automotive advisor built into Africa's leading vehicle import and ownership platform.

${OBD_KNOWLEDGE}

YOUR CAPABILITIES:
- Diagnose OBD-II / check-engine codes precisely using the database above
- Give step-by-step maintenance advice tailored to the Nigerian market
- Help users understand vehicle import timelines, costs, duties and processes
- Compare vehicles (BYD, GAC, Chery, XPeng, Toyota, etc.) with real specs
- Advise on insurance, registration, and running costs in Nigeria
- Answer questions about the user's specific garage vehicles when context is provided

RESPONSE STYLE:
- Be conversational, warm, and specific. Never give vague "consult a mechanic" non-answers unless genuinely critical safety is at risk.
- Use Nigerian context (Lagos, Abuja, fuel costs in Naira, port processes, etc.)
- Format responses with short paragraphs. Use bullet points only when listing steps or multiple items.
- Never produce markdown tables — use bullet points instead.
- For OBD codes: always give the severity, physical symptoms, and specific fix steps.
- Keep responses focused and under 300 words unless a detailed explanation is truly needed.`;

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.json();
  const { messages = [], vehicleContext = "" } = body;

  const systemContent = vehicleContext
    ? `${SYSTEM_PROMPT}\n\nCURRENT VEHICLE CONTEXT:\n${vehicleContext}`
    : SYSTEM_PROMPT;

  const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://allvex-six.vercel.app",
      "X-Title": "Allvex AI Assistant",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      max_tokens: 600,
      stream: true,
      messages: [
        { role: "system", content: systemContent },
        ...messages,
      ],
    }),
  });

  if (!upstream.ok) {
    const err = await upstream.text();
    return new Response(JSON.stringify({ error: err }), {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Stream the response directly to the client
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
