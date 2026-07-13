// Shared detail-shot bank (interior/engine are representative, not brand-specific —
// Allvex doesn't have real supplier photography yet).
const REAR_VIEW = "https://images.pexels.com/photos/36718056/pexels-photo-36718056.jpeg?auto=compress&cs=tinysrgb&w=800";
const INTERIOR_DASH = "https://images.pexels.com/photos/36718053/pexels-photo-36718053.jpeg?auto=compress&cs=tinysrgb&w=800";
const INTERIOR_SEATS = "https://images.pexels.com/photos/36646941/pexels-photo-36646941.jpeg?auto=compress&cs=tinysrgb&w=800";
const ENGINE_BAY = "https://images.pexels.com/photos/16545849/pexels-photo-16545849.jpeg?auto=compress&cs=tinysrgb&w=800";

function buildGallery(frontImage) {
  return [
    { url: frontImage, category: "Exterior", label: "Front" },
    { url: REAR_VIEW, category: "Exterior", label: "Rear" },
    { url: INTERIOR_DASH, category: "Interior", label: "Dashboard" },
    { url: INTERIOR_SEATS, category: "Interior", label: "Seats" },
    { url: ENGINE_BAY, category: "Engine", label: "Engine Bay" },
  ];
}

export const vehicles = [
  {
    id: "byd-seal-premium",
    brand: "BYD",
    model: "Seal Premium",
    year: 2025,
    fuel: "Electric",
    transmission: "Automatic",
    mileage: 0,
    condition: "New",
    price: 32500000,
    delivery: "35–45 Days",
    verified: true,
    category: "Electric",
    score: 91,
    image: "https://images.pexels.com/photos/32232616/pexels-photo-32232616.jpeg?auto=compress&cs=tinysrgb&w=800",
    gallery: buildGallery("https://images.pexels.com/photos/32232616/pexels-photo-32232616.jpeg?auto=compress&cs=tinysrgb&w=800"),
    specs: { engine: "Dual Motor AWD", battery: "82.5 kWh", hp: "530 hp", range: "570 km", seats: 5, drive: "AWD" },
    performance: { accel: "3.8s 0–100km/h", topSpeed: "180 km/h", charge: "26 min (10-80%)" },
    ownership: { insurance: 850000, maintenance: 300000, running: 180000 },
    features: ["Adaptive Cruise", "Panoramic Roof", "Wireless Charging", "Apple CarPlay", "Lane Assist", "360 Camera"],
  },
  {
    id: "gac-gs8",
    brand: "GAC",
    model: "GS8",
    year: 2024,
    fuel: "Petrol",
    transmission: "Automatic",
    mileage: 0,
    condition: "New",
    price: 28900000,
    delivery: "30–40 Days",
    verified: true,
    category: "SUV",
    score: 86,
    image: "https://images.pexels.com/photos/30795598/pexels-photo-30795598.jpeg?auto=compress&cs=tinysrgb&w=800",
    gallery: buildGallery("https://images.pexels.com/photos/30795598/pexels-photo-30795598.jpeg?auto=compress&cs=tinysrgb&w=800"),
    specs: { engine: "2.0T Turbo", battery: "—", hp: "248 hp", range: "—", seats: 7, drive: "AWD" },
    performance: { accel: "8.5s 0–100km/h", topSpeed: "195 km/h", charge: "—" },
    ownership: { insurance: 620000, maintenance: 240000, running: 210000 },
    features: ["Panoramic Roof", "Apple CarPlay", "Android Auto", "Parking Sensors", "ADAS"],
  },
  {
    id: "chery-tiggo-8",
    brand: "Chery",
    model: "Tiggo 8 Pro",
    year: 2024,
    fuel: "Petrol",
    transmission: "Automatic",
    mileage: 0,
    condition: "New",
    price: 19800000,
    delivery: "25–35 Days",
    verified: true,
    category: "SUV",
    score: 82,
    image: "https://images.pexels.com/photos/14776590/pexels-photo-14776590.jpeg?auto=compress&cs=tinysrgb&w=800",
    gallery: buildGallery("https://images.pexels.com/photos/14776590/pexels-photo-14776590.jpeg?auto=compress&cs=tinysrgb&w=800"),
    specs: { engine: "1.6T", battery: "—", hp: "197 hp", range: "—", seats: 7, drive: "FWD" },
    performance: { accel: "9.7s 0–100km/h", topSpeed: "185 km/h", charge: "—" },
    ownership: { insurance: 480000, maintenance: 190000, running: 160000 },
    features: ["Leather Seats", "Sunroof", "Android Auto", "Parking Camera"],
  },
  {
    id: "xpeng-p7",
    brand: "XPeng",
    model: "P7",
    year: 2025,
    fuel: "Electric",
    transmission: "Automatic",
    mileage: 0,
    condition: "New",
    price: 35200000,
    delivery: "40–50 Days",
    verified: false,
    category: "Electric",
    score: 88,
    image: "https://images.pexels.com/photos/16490609/pexels-photo-16490609.jpeg?auto=compress&cs=tinysrgb&w=800",
    gallery: buildGallery("https://images.pexels.com/photos/16490609/pexels-photo-16490609.jpeg?auto=compress&cs=tinysrgb&w=800"),
    specs: { engine: "Rear Motor", battery: "80.9 kWh", hp: "469 hp", range: "610 km", seats: 5, drive: "RWD" },
    performance: { accel: "4.3s 0–100km/h", topSpeed: "170 km/h", charge: "29 min (10-80%)" },
    ownership: { insurance: 900000, maintenance: 280000, running: 170000 },
    features: ["ADAS", "Wireless Charging", "Panoramic Roof", "Lane Keeping Assist"],
  },
];

export const garageVehicles = [
  {
    id: "my-seal",
    nickname: "My Seal",
    brand: "BYD",
    model: "Seal Premium",
    year: 2025,
    color: "Deep Blue",
    plate: "LND-442-KJ",
    mileage: 8420,
    health: 94,
    nextService: "Oil Change · 9 days",
    insurance: "Expires in 18 days",
    image: "https://images.pexels.com/photos/32232616/pexels-photo-32232616.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "my-prado",
    nickname: "Family Prado",
    brand: "Toyota",
    model: "Land Cruiser Prado",
    year: 2022,
    color: "Pearl White",
    plate: "ABJ-119-XZ",
    mileage: 41200,
    health: 78,
    nextService: "Brake Inspection · Overdue",
    insurance: "Valid",
    image: "https://images.pexels.com/photos/5288744/pexels-photo-5288744.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

export const reminders = [
  { id: 1, title: "Oil Change", vehicle: "My Seal", due: "Due in 8 days", level: "upcoming" },
  { id: 2, title: "Insurance Renewal", vehicle: "My Seal", due: "Expires in 21 days", level: "upcoming" },
  { id: 3, title: "Vehicle License", vehicle: "Family Prado", due: "Expires tomorrow", level: "due" },
  { id: 4, title: "Brake Inspection", vehicle: "Family Prado", due: "Overdue by 3 days", level: "overdue" },
];

export const activeImport = {
  vehicle: "BYD Seal Premium",
  stage: "Shipping to Lagos",
  eta: "18 Days",
  progress: 65,
  image: "https://images.pexels.com/photos/32232616/pexels-photo-32232616.jpeg?auto=compress&cs=tinysrgb&w=800",
};

export const importTimeline = [
  { label: "Inquiry Submitted", done: true, date: "Jun 02" },
  { label: "Quote Approved", done: true, date: "Jun 05" },
  { label: "Deposit Paid", done: true, date: "Jun 06" },
  { label: "Vehicle Purchased", done: true, date: "Jun 14" },
  { label: "Container Loaded", done: true, date: "Jun 28" },
  { label: "At Sea", done: true, current: true, date: "Jul 13" },
  { label: "Arrived Destination Port", done: false, date: "Est. Jul 24" },
  { label: "Customs Clearance", done: false, date: "Est. Jul 28" },
  { label: "Ready for Delivery", done: false, date: "Est. Aug 01" },
];

export const articles = [
  { id: 1, title: "Best SUVs Under ₦25m in 2026", time: "6 min read", image: "https://images.pexels.com/photos/14776592/pexels-photo-14776592.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: 2, title: "Should You Buy an Electric Vehicle in Nigeria?", time: "8 min read", image: "https://images.pexels.com/photos/11589801/pexels-photo-11589801.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: 3, title: "BYD vs Toyota: Ownership Cost Compared", time: "5 min read", image: "https://images.pexels.com/photos/27502215/pexels-photo-27502215.jpeg?auto=compress&cs=tinysrgb&w=600" },
];

export const accessories = [
  { id: 1, name: "4K Dashcam", price: 85000, rating: 4.8, image: "https://images.pexels.com/photos/14776593/pexels-photo-14776593.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { id: 2, name: "OBD-II Scanner", price: 42000, rating: 4.6, image: "https://images.pexels.com/photos/12271951/pexels-photo-12271951.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { id: 3, name: "Jump Starter Pro", price: 55000, rating: 4.7, image: "https://images.pexels.com/photos/12920605/pexels-photo-12920605.jpeg?auto=compress&cs=tinysrgb&w=400" },
];
