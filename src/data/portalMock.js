export const customers = [
  { id: 1, name: "Alex Johnson", email: "alex.johnson@email.com", vehicles: 2, activeOrders: 1, status: "Active", joined: "Mar 2025" },
  { id: 2, name: "Ngozi Eze", email: "ngozi.eze@email.com", vehicles: 1, activeOrders: 0, status: "Active", joined: "Jan 2025" },
  { id: 3, name: "Tunde Bakare", email: "tunde.b@email.com", vehicles: 3, activeOrders: 1, status: "Active", joined: "Nov 2024" },
  { id: 4, name: "Amaka Chukwu", email: "amaka.c@email.com", vehicles: 0, activeOrders: 1, status: "Suspended", joined: "Jun 2025" },
  { id: 5, name: "David Okon", email: "d.okon@email.com", vehicles: 1, activeOrders: 0, status: "Active", joined: "Feb 2025" },
];

export const adminOrders = [
  { id: "ALX-20394", customer: "Alex Johnson", vehicle: "BYD Seal Premium", stage: "At Sea", eta: "18 days", status: "in_progress" },
  { id: "ALX-20388", customer: "Tunde Bakare", vehicle: "GAC GS8", stage: "Customs Clearance", eta: "4 days", status: "attention" },
  { id: "ALX-20376", customer: "Amaka Chukwu", vehicle: "Chery Tiggo 8 Pro", stage: "Awaiting Deposit", eta: "—", status: "action_needed" },
  { id: "ALX-20351", customer: "Ngozi Eze", vehicle: "XPeng P7", stage: "Delivered", eta: "Completed", status: "completed" },
];

export const suppliers = [
  { id: 1, name: "Guangzhou Auto Trading Co.", vehiclesListed: 24, rating: 4.8, status: "Approved" },
  { id: 2, name: "Shenzhen EV Exports Ltd.", vehiclesListed: 12, rating: 4.6, status: "Approved" },
  { id: 3, name: "Jiangsu Motor Group", vehiclesListed: 5, rating: 4.1, status: "Pending Review" },
];

export const inspectors = [
  { id: 1, name: "Chinedu Obi", assigned: 3, completed: 47, rating: 4.9, location: "Lagos Port" },
  { id: 2, name: "Fatima Sule", assigned: 1, completed: 32, rating: 4.7, location: "Apapa" },
  { id: 3, name: "Emeka Nwosu", assigned: 2, completed: 21, rating: 4.5, location: "Tin Can Island" },
];

export const adminVehicles = [
  { id: 1, name: "BYD Seal Premium", brand: "BYD", price: "₦32.5m", verified: true, status: "Live" },
  { id: 2, name: "GAC GS8", brand: "GAC", price: "₦28.9m", verified: true, status: "Live" },
  { id: 3, name: "Chery Tiggo 8 Pro", brand: "Chery", price: "₦19.8m", verified: true, status: "Live" },
  { id: 4, name: "XPeng P7", brand: "XPeng", price: "₦35.2m", verified: false, status: "Pending Inspection" },
];

export const articles = [
  { id: 1, title: "Best SUVs Under ₦25m in 2026", status: "Published", reads: "12.4k" },
  { id: 2, title: "Should You Buy an EV in Nigeria?", status: "Published", reads: "8.1k" },
  { id: 3, title: "BYD vs Toyota: Ownership Cost Compared", status: "Draft", reads: "—" },
];

export const supplierInventory = [
  { id: 1, name: "BYD Seal Premium", year: 2025, price: "₦32.5m", status: "Listed", orders: 3 },
  { id: 2, name: "BYD Atto 3", year: 2024, price: "₦24.1m", status: "Listed", orders: 1 },
  { id: 3, name: "BYD Song Plus", year: 2025, price: "₦27.8m", status: "Pending Approval", orders: 0 },
];

export const supplierOrders = [
  { id: "ALX-20394", vehicle: "BYD Seal Premium", customer: "Alex Johnson", stage: "Container Booked", action: "Update Shipment" },
  { id: "ALX-20402", vehicle: "BYD Atto 3", customer: "David Okon", stage: "Awaiting Confirmation", action: "Confirm Order" },
];

export const supplierQuotes = [
  { id: 1, vehicle: "BYD Seal Premium", customer: "Ngozi Eze", budget: "₦30m – ₦34m", status: "Awaiting Response" },
  { id: 2, vehicle: "BYD Song Plus", customer: "Tunde Bakare", budget: "₦25m – ₦29m", status: "Awaiting Response" },
];

export const assignedInspections = [
  { id: 1, vehicle: "GAC GS8", vin: "LGAC4S8B2R0012934", location: "Shenzhen Port", due: "Today", status: "pending" },
  { id: 2, vehicle: "Chery Tiggo 8 Pro", vin: "LVVDB21B2RD044521", location: "Guangzhou Yard 4", due: "Tomorrow", status: "pending" },
];

export const completedInspections = [
  { id: 1, vehicle: "BYD Seal Premium", vin: "LC0C56E9XR0193822", date: "Jul 10, 2026", result: "Passed" },
  { id: 2, vehicle: "XPeng P7", vin: "LFP7A2B19PN002331", date: "Jul 08, 2026", result: "Minor Issues" },
  { id: 3, vehicle: "GAC S7", vin: "LGAC7S1B9R0034821", date: "Jul 02, 2026", result: "Passed" },
];

export const tickets = [
  { id: "TCK-3391", customer: "Amaka Chukwu", subject: "Deposit not reflecting on order", priority: "High", status: "Open" },
  { id: "TCK-3388", customer: "David Okon", subject: "Question about insurance add-on", priority: "Low", status: "Open" },
  { id: "TCK-3379", customer: "Tunde Bakare", subject: "Customs delay clarification", priority: "Medium", status: "In Progress" },
  { id: "TCK-3350", customer: "Ngozi Eze", subject: "Warranty document missing", priority: "Low", status: "Resolved" },
];

export const ticketThread = [
  { from: "customer", text: "Hi, I paid my deposit yesterday but the order still shows Awaiting Deposit. Can you check?" },
  { from: "agent", text: "Thanks for flagging this, Amaka. Could you share the transaction reference or receipt?" },
  { from: "customer", text: "Sure — REF: TXN-88213042, paid via bank transfer at 4:12pm yesterday." },
];
