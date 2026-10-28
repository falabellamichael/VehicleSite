export type SceneId = "engine" | "lift" | "brakes";
export interface Finding {
  id: string;
  scene: SceneId;
  name: string;
  note: string;
  action: string;
  x: number;
  y: number;
  attention: boolean;
  hours: number;
  parts: number;
}

// All findings, prices, hours, vehicles, and customer notes are fictional examples.
// Parts are integer cents. Tax is an illustrative assumption, not a tax quotation.
export const laborRate = 12800;
export const taxRate = 0.075;
export const findings: Finding[] = [
  {
    id: "intake",
    scene: "engine",
    name: "Intake hose",
    note: "A little air where it doesn't belong. Intake coupling is starting to split.",
    action: "Replace intake coupling",
    x: 0.51,
    y: 0.51,
    attention: true,
    hours: 0.6,
    parts: 4200,
  },
  {
    id: "fluid",
    scene: "engine",
    name: "Fluid reservoir",
    note: "Level checked. Cap and seal look good. No action needed today.",
    action: "Fluid level check",
    x: 0.63,
    y: 0.32,
    attention: false,
    hours: 0,
    parts: 0,
  },
  {
    id: "mount",
    scene: "engine",
    name: "Strut mount",
    note: "Mount is secure. No visible movement at the mounting points.",
    action: "Mount inspection",
    x: 0.87,
    y: 0.28,
    attention: false,
    hours: 0,
    parts: 0,
  },
  {
    id: "tire",
    scene: "lift",
    name: "Rear tire",
    note: "Uneven wear at the shoulder. Check alignment before the next set of tires.",
    action: "Four-wheel alignment",
    x: 0.24,
    y: 0.62,
    attention: true,
    hours: 1,
    parts: 0,
  },
  {
    id: "exhaust",
    scene: "lift",
    name: "Exhaust hanger",
    note: "A tired rubber hanger explains that rattle over the bumps.",
    action: "Replace exhaust hanger",
    x: 0.68,
    y: 0.44,
    attention: true,
    hours: 0.4,
    parts: 2400,
  },
  {
    id: "suspension",
    scene: "lift",
    name: "Rear suspension",
    note: "Bushings visually checked. No obvious tears. Verify under load.",
    action: "Suspension inspection",
    x: 0.48,
    y: 0.57,
    attention: false,
    hours: 0,
    parts: 0,
  },
  {
    id: "pads",
    scene: "brakes",
    name: "Front brake pads",
    note: "Front pads at 3 mm. Replace soon. We'll show you the measurement.",
    action: "Front brake pads & rotors",
    x: 0.55,
    y: 0.39,
    attention: true,
    hours: 1.6,
    parts: 23800,
  },
  {
    id: "rotor",
    scene: "brakes",
    name: "Brake rotor",
    note: "Wear lip at the edge. Rotor replacement included with the front brake service.",
    action: "Rotor inspection",
    x: 0.29,
    y: 0.53,
    attention: true,
    hours: 0,
    parts: 0,
  },
  {
    id: "line",
    scene: "brakes",
    name: "Brake hose",
    note: "Hose looks dry. No visible cracks or seepage at the connection.",
    action: "Brake hose inspection",
    x: 0.34,
    y: 0.18,
    attention: false,
    hours: 0,
    parts: 0,
  },
];
export const repairItems = findings.filter((item) => item.hours > 0);
export const scenes = {
  engine: {
    number: "01",
    label: "Under the hood",
    photo: "/media/garage/engine.jpg",
    depth: "/media/garage/engine-depth.png",
    aspect: 1600 / 1201,
    alt: "Open engine bay with an intake hose, fluid reservoir, and strut mount",
    credit: "Aliaksei Semirski",
    source: "https://www.pexels.com/photo/close-up-of-car-engine-13972256/",
  },
  lift: {
    number: "02",
    label: "On the lift",
    photo: "/media/garage/lift.jpg",
    depth: "/media/garage/lift-depth.png",
    aspect: 1400 / 788,
    alt: "Rear underside of a car on a garage lift, with its wheel, exhaust, and suspension visible",
    credit: "Artem Podrez",
    source:
      "https://www.pexels.com/photo/car-on-a-lifter-inside-a-garage-8985514/",
  },
  brakes: {
    number: "03",
    label: "At the brake corner",
    photo: "/media/garage/brakes.jpg",
    depth: "/media/garage/brakes-depth.png",
    aspect: 1400 / 933,
    alt: "A mechanic inspecting an exposed brake rotor and caliper",
    credit: "agustin olmedo",
    source:
      "https://www.pexels.com/photo/automotive-brake-maintenance-in-workshop-30470930/",
  },
} satisfies Record<
  SceneId,
  {
    number: string;
    label: string;
    photo: string;
    depth: string;
    aspect: number;
    alt: string;
    credit: string;
    source: string;
  }
>;
export const guideVehicles = [
  { id: "sedan", label: "2017–2022 · midsize sedan", factor: 1 },
  { id: "suv", label: "2017–2022 · compact SUV", factor: 1.15 },
  { id: "truck", label: "2017–2022 · light pickup", factor: 1.35 },
];
export const guideJobs = [
  {
    id: "brakes",
    label: "Front pads & rotors",
    hours: 1.6,
    low: 19800,
    high: 27800,
    ready: "1 working day after approval",
  },
  {
    id: "oil",
    label: "Oil & filter service",
    hours: 0.5,
    low: 3800,
    high: 6500,
    ready: "About 1 hour after approval",
  },
  {
    id: "alternator",
    label: "Alternator replacement",
    hours: 2,
    low: 23000,
    high: 38000,
    ready: "1–2 working days after approval",
  },
  {
    id: "diagnosis",
    label: "Initial diagnostic hour",
    hours: 1,
    low: 0,
    high: 0,
    ready: "Findings on the same working day",
  },
];
export const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
export const labor = (hours: number) => Math.round(hours * laborRate);
export const withTax = (cents: number) => cents + Math.round(cents * taxRate);
export function daytonClock(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const minutes = Number(value("hour")) * 60 + Number(value("minute"));
  const day = value("weekday");
  const open =
    day !== "Sun" &&
    (day === "Sat"
      ? minutes >= 540 && minutes < 780
      : minutes >= 480 && minutes < 1080);
  return {
    open,
    time: new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(now),
  };
}
