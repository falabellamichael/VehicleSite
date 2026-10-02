/** Dealer-ready demo content. All cars, prices, specifications and stock states are fictional. */
export interface Vehicle {
  id: string; name: string; category: string; edition: string; year: number;
  price: number; mileage: number; seats: number; bags: number; power: string;
  transmission: string; drivetrain: string; condition: "New" | "Pre-owned";
  stock: "Available" | "Incoming" | "Sold"; stockNumber: string;
  description: string; mood: string; color: string;
  kind: "coupe" | "sedan" | "suv" | "van"; image: string;
  features: string[]; gallery: { label: string; src: string }[];
}
const gallery = () => [
  { label: "Exterior", src: "" }, { label: "Interior", src: "" },
  { label: "Details", src: "" },
];
export const vehicles: Vehicle[] = [
  { id: "apex", name: "Apex GT", category: "Coupe", edition: "Signature · Performance", year: 2024, price: 68900, mileage: 18400, seats: 2, bags: 2, power: "Petrol", transmission: "Automatic", drivetrain: "Rear-wheel drive", condition: "Pre-owned", stock: "Available", stockNumber: "DEMO-001", description: "The long way home, every time. A sculpted two-seat grand tourer with an unmistakable silhouette and a driver-focused cabin.", mood: "For the driving enthusiast", color: "#c8ad82", kind: "coupe", image: "", features: ["Panoramic roof", "Heated sport seats", "Premium audio", "Adaptive cruise"], gallery: gallery() },
  { id: "noir", name: "Noir Executive", category: "Sedan", edition: "Executive · Hybrid", year: 2023, price: 42900, mileage: 32600, seats: 5, bags: 3, power: "Hybrid", transmission: "Automatic", drivetrain: "All-wheel drive", condition: "Pre-owned", stock: "Available", stockNumber: "DEMO-002", description: "Quiet confidence for the everyday. An understated hybrid sedan with a spacious cabin and thoughtful comfort features.", mood: "For your daily upgrade", color: "#92a5ac", kind: "sedan", image: "", features: ["Heated steering wheel", "360° camera", "Wireless charging", "Memory seats"], gallery: gallery() },
  { id: "atlas", name: "Atlas Grand", category: "SUV", edition: "Adventure · Seven seats", year: 2025, price: 56900, mileage: 12400, seats: 7, bags: 4, power: "Petrol", transmission: "Automatic", drivetrain: "All-wheel drive", condition: "Pre-owned", stock: "Available", stockNumber: "DEMO-003", description: "More room for your real life. A seven-seat SUV for school runs, road trips, and everything you bring along.", mood: "For the whole family", color: "#99a58a", kind: "suv", image: "", features: ["Third-row seating", "Power tailgate", "Roof rails", "Rear climate control"], gallery: gallery() },
  { id: "pulse", name: "Pulse Electric", category: "Sedan", edition: "Future · All electric", year: 2026, price: 48900, mileage: 0, seats: 5, bags: 3, power: "Electric", transmission: "Single speed", drivetrain: "Rear-wheel drive", condition: "New", stock: "Available", stockNumber: "DEMO-004", description: "A fresh start, without the fuel stop. A clean-lined electric sedan with a bright cabin and a different kind of energy.", mood: "For a new direction", color: "#a9a4c4", kind: "sedan", image: "", features: ["Glass roof", "Heated seats", "App-ready cockpit", "Charging cable slot"], gallery: gallery() },
  { id: "vista", name: "Vista Open", category: "Convertible", edition: "Open air · Weekend", year: 2022, price: 37900, mileage: 41800, seats: 2, bags: 1, power: "Petrol", transmission: "Automatic", drivetrain: "Rear-wheel drive", condition: "Pre-owned", stock: "Sold", stockNumber: "DEMO-005", description: "A little less roof. A little more horizon. This example shows how a sold listing stays useful without accepting appointments.", mood: "For the weekend", color: "#c7a192", kind: "coupe", image: "", features: ["Retractable roof", "Sport steering wheel", "Rear camera", "Heated seats"], gallery: gallery() },
  { id: "suite", name: "Suite Touring", category: "Van", edition: "Together · Family", year: 2024, price: 39900, mileage: 26700, seats: 7, bags: 6, power: "Hybrid", transmission: "Automatic", drivetrain: "Front-wheel drive", condition: "Pre-owned", stock: "Available", stockNumber: "DEMO-006", description: "Room for people. Room for plans. A versatile family van with flexible seating and an easygoing personality.", mood: "For room to grow", color: "#b4b4aa", kind: "van", image: "", features: ["Sliding rear doors", "Flexible seating", "Rear climate control", "Parking sensors"], gallery: gallery() },
  { id: "metro", name: "Metro Sport", category: "Sedan", edition: "Everyday · Compact", year: 2021, price: 21900, mileage: 58300, seats: 5, bags: 2, power: "Petrol", transmission: "Automatic", drivetrain: "Front-wheel drive", condition: "Pre-owned", stock: "Available", stockNumber: "DEMO-007", description: "Your first set of keys, reimagined. A compact everyday sedan with a simple cabin and a city-friendly footprint.", mood: "For your first car", color: "#a9b9b7", kind: "sedan", image: "", features: ["Rear camera", "Phone connectivity", "Heated front seats", "Cruise control"], gallery: gallery() },
  { id: "ridge", name: "Ridge Trail", category: "SUV", edition: "Explorer · All wheel", year: 2026, price: 45900, mileage: 0, seats: 5, bags: 4, power: "Hybrid", transmission: "Automatic", drivetrain: "All-wheel drive", condition: "New", stock: "Incoming", stockNumber: "DEMO-008", description: "Something worth looking forward to. An incoming SUV concept; save it to your shortlist while the listing is being prepared.", mood: "For the next adventure", color: "#b6a486", kind: "suv", image: "", features: ["Roof rails", "All-weather cabin", "Heated steering wheel", "Surround-view camera"], gallery: gallery() },
  { id: "volt", name: "Volt City", category: "Sedan", edition: "Urban · Electric", year: 2023, price: 28900, mileage: 23900, seats: 5, bags: 2, power: "Electric", transmission: "Single speed", drivetrain: "Front-wheel drive", condition: "Pre-owned", stock: "Available", stockNumber: "DEMO-009", description: "Small footprint. Fresh perspective. A compact electric example for shoppers exploring a different everyday drive.", mood: "For the city", color: "#9fb39e", kind: "sedan", image: "", features: ["Heated seats", "Phone connectivity", "Parking sensors", "Charging cable slot"], gallery: gallery() },
];
export const categories = ["All styles", ...new Set(vehicles.map(v => v.category))];
export const navigation = [["/", "Home"], ["/inventory", "Inventory"], ["/buying", "Buying tools"], ["/pickup", "Pickup & test drives"], ["/documents", "Documents"]] as const;
export const documentGroups = [
  { id: "vehicle-records", name: "Vehicle records", number: "01", icon: "car", description: "The facts behind the car: specification sheets, history questions, and inspection notes.", docs: [
    { id: "vehicle-specifications", title: "Vehicle specification sheet", description: "Fields for verified equipment, mileage, and identification.", pages: "Reference" },
    { id: "history-checklist", title: "Vehicle history checklist", description: "Questions to ask before choosing a pre-owned car.", pages: "Checklist" },
    { id: "inspection-notes", title: "Inspection & condition notes", description: "A blank walk-around and inspection record, not an inspection certificate.", pages: "Worksheet" },
  ] },
  { id: "purchase-options", name: "Purchase options", number: "02", icon: "key", description: "Understand your numbers, prepare a trade-in, and collect the questions that matter.", docs: [
    { id: "cash-purchase", title: "Cash purchase worksheet", description: "An itemized outline awaiting actual dealer pricing and terms.", pages: "Worksheet" },
    { id: "finance-worksheet", title: "Finance comparison worksheet", description: "Compare written offers without submitting a credit application.", pages: "Worksheet" },
    { id: "trade-in-checklist", title: "Trade-in preparation", description: "Organize condition notes, service records, and appraisal questions.", pages: "Checklist" },
  ] },
  { id: "pickup-essentials", name: "Pickup essentials", number: "03", icon: "shield", description: "Prepare for the handover, learn the controls, and plan the first drive home.", docs: [
    { id: "pickup-checklist", title: "Pickup-day checklist", description: "A discussion checklist to confirm with the seller before visiting.", pages: "Checklist" },
    { id: "handover-walkthrough", title: "Vehicle handover walkthrough", description: "Keys, controls, condition, and features to review together.", pages: "Walkthrough" },
    { id: "ownership-care", title: "Your first week of ownership", description: "A blank care and contact guide for your actual vehicle.", pages: "Care guide" },
  ] },
  { id: "policies", name: "Policies & essentials", number: "04", icon: "file", description: "Clearly separated draft spaces for approved sales terms, privacy, and warranty information.", docs: [
    { id: "sales-terms", title: "Sales terms template", description: "No contract or deposit policy is in effect; approved terms go here.", pages: "Draft template" },
    { id: "privacy-template", title: "Privacy information template", description: "A structure for the eventual dealership data-handling policy.", pages: "Draft template" },
    { id: "warranty-template", title: "Warranty information template", description: "Empty fields for verified warranty terms; no coverage is promised.", pages: "Draft template" },
  ] },
];
export type DocumentGroup = (typeof documentGroups)[number];
export const media = { heroVideo: "", heroPoster: "", brandVideo: "", brandPoster: "" };
export const pickupChecklist = ["Confirm the appointment and location with the seller", "Ask which identification and insurance documents are needed", "Confirm the final written price and payment arrangements", "Review the vehicle condition, keys, and agreed accessories", "Plan a controls and features walkthrough"];
export const testDriveChecklist = ["Confirm the appointment and test-drive requirements", "Prepare questions about condition and vehicle history", "Think about your usual routes and parking needs", "Check cabin space, visibility, and seating comfort", "Ask to review the actual vehicle records"];
export const faqs = [
  ["Can I buy or reserve a car here?", "Not yet. This is a dealership demonstration with fictional inventory. Explore cars, compare them, and create a visit draft; no purchase, hold, deposit, or appointment is made."],
  ["Are the prices and vehicle records real?", "No. All prices are illustrative Canadian-dollar placeholders, excluding tax and fees. Cars, equipment, mileage, stock states, and documents must be replaced with verified dealer information."],
  ["Does the payment tool check my credit?", "No. It is a local arithmetic calculator, not a credit application, approval, lender offer, or appraisal. No information is sent to a lender or dealer."],
  ["What does a pickup date do?", "It records your preferred date and time in a draft. A downloaded calendar reminder is explicitly unconfirmed. The seller must agree to the appointment separately."],
  ["Where is my shortlist stored?", "Saved car IDs and display preferences stay in this browser. Draft visit details and calculator inputs remain in page memory and are not sent to a server."],
];
