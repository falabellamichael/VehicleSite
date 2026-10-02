import { vehicles, type Vehicle } from "./data";
export const money = (value: number, digits = 0) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
export const distance = (value: number) => `${value.toLocaleString("en-CA")} km`;
export function filterVehicles(params: URLSearchParams, saved: string[] = []): Vehicle[] {
  const query = (params.get("q") || "").trim().toLowerCase();
  const numeric = (key: string, fallback: number) => { const raw = params.get(key); const n = raw === null || raw.trim() === "" ? fallback : Number(raw); return Number.isFinite(n) && n >= 0 ? n : fallback; };
  const result = vehicles.filter(v => (!query || `${v.name} ${v.year} ${v.category} ${v.power} ${v.features.join(" ")}`.toLowerCase().includes(query))
    && (!params.get("body") || v.category === params.get("body"))
    && (!params.get("fuel") || v.power === params.get("fuel"))
    && (!params.get("condition") || v.condition === params.get("condition"))
    && v.price <= numeric("max", Infinity) && v.mileage <= numeric("km", Infinity)
    && v.seats >= numeric("seats", 0)
    && (params.get("saved") !== "1" || saved.includes(v.id))
    && (params.get("available") !== "1" || v.stock === "Available"));
  const sort = params.get("sort");
  return [...result].sort((a, b) => sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : sort === "mileage" ? a.mileage - b.mileage : sort === "year" ? b.year - a.year : vehicles.indexOf(a) - vehicles.indexOf(b));
}
export interface PaymentInputs { price: number; down: number; trade: number; owing: number; fees: number; tax: number; apr: number; months: number }
export function calculatePayment(input: PaymentInputs) {
  if (Object.values(input).some(n => !Number.isFinite(n) || n < 0) || input.months < 1 || input.months > 120 || !Number.isInteger(input.months) || input.apr > 100 || input.tax > 100) throw new Error("Enter valid, non-negative amounts and a valid loan term.");
  const taxAmount = input.price * input.tax / 100;
  const purchaseTotal = input.price + input.fees + taxAmount;
  const equity = input.trade - input.owing;
  const balance = purchaseTotal - input.down - equity;
  const principal = Math.max(0, balance);
  const rate = input.apr / 1200;
  const monthly = principal === 0 ? 0 : rate === 0 ? principal / input.months : principal * rate / (1 - (1 + rate) ** -input.months);
  const loanTotal = monthly * input.months;
  return { taxAmount, purchaseTotal, equity, principal, monthly, loanTotal, interest: Math.max(0, loanTotal - principal), excess: Math.max(0, -balance) };
}
export function dayFromToday(offset: number) { const d = new Date(); d.setDate(d.getDate() + offset); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
export function formatDay(date: string) { return new Date(`${date}T12:00:00`).toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric", year: "numeric" }); }
export function visitDateValid(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return false;
  const stamp = new Date(`${date}T${time}:00`);
  return Number.isFinite(stamp.getTime()) && stamp.getFullYear() === Number(date.slice(0, 4)) && stamp.getMonth() + 1 === Number(date.slice(5, 7)) && stamp.getDate() === Number(date.slice(8, 10)) && stamp.getHours() === Number(time.slice(0, 2)) && stamp.getMinutes() === Number(time.slice(3, 5)) && stamp.getTime() > Date.now();
}
/** Calendar exports are personal, unconfirmed reminders, never invitations. */
export function makeCalendar(date: string, time: string, purpose: string, vehicle: string, note = "") {
  if (!visitDateValid(date, time)) throw new Error("Choose a valid future date and time.");
  const start = new Date(`${date}T${time}:00`);
  const end = new Date(start.getTime() + 45 * 60000);
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//VehicleSite//Visit Draft//EN", "CALSCALE:GREGORIAN", "BEGIN:VEVENT", `UID:${crypto.randomUUID()}@vehiclesite.demo`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, `SUMMARY:${escape(`UNCONFIRMED: ${purpose} - ${vehicle}`)}`, `DESCRIPTION:${escape(`DEMO ONLY. Preferred appointment, not booked. Contact the actual seller to confirm date, time, location and requirements. No notification has been sent. ${note}`)}`, "LOCATION:To be confirmed with the seller", "STATUS:TENTATIVE", "TRANSP:TRANSPARENT", "END:VEVENT", "END:VCALENDAR"];
  // RFC 5545 line folding counts UTF-8 octets, not JavaScript characters.
  const fold = (line: string) => { let out = "", current = ""; for (const c of line) { if (new TextEncoder().encode(current + c).length > 75) { out += current + "\r\n"; current = " "; } current += c; } return out + current; };
  return lines.map(fold).join("\r\n") + "\r\n";
}
