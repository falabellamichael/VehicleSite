/** All entries are fictional placeholders. Replace this file to populate the site. */
export type Category =
  | "Grand touring"
  | "Executive"
  | "SUV"
  | "Electric"
  | "Open top"
  | "Group travel";
export interface Vehicle {
  id: string;
  name: string;
  category: Category;
  edition: string;
  seats: number;
  bags: number;
  power: string;
  transmission: string;
  description: string;
  mood: string;
  color: string;
  kind: "coupe" | "sedan" | "suv" | "van";
  image: string;
}
export const vehicles: Vehicle[] = [
  {
    id: "apex",
    name: "Apex GT",
    category: "Grand touring",
    edition: "The signature collection",
    seats: 2,
    bags: 2,
    power: "Performance",
    transmission: "Automatic",
    description:
      "Sculpted lines. Effortless momentum. A grand tourer for the moments that deserve a little more.",
    mood: "For the drive",
    color: "#c8ad82",
    kind: "coupe",
    image: "",
  },
  {
    id: "noir",
    name: "Noir Executive",
    category: "Executive",
    edition: "The executive collection",
    seats: 4,
    bags: 3,
    power: "Hybrid",
    transmission: "Automatic",
    description:
      "A quiet statement. An expansive cabin and an understated presence, designed around your arrival.",
    mood: "For the arrival",
    color: "#92a5ac",
    kind: "sedan",
    image: "",
  },
  {
    id: "atlas",
    name: "Atlas Grand",
    category: "SUV",
    edition: "The destination collection",
    seats: 6,
    bags: 4,
    power: "All-wheel drive",
    transmission: "Automatic",
    description:
      "More space for what matters. A commanding silhouette, composed comfort, and room for the whole itinerary.",
    mood: "For the escape",
    color: "#99a58a",
    kind: "suv",
    image: "",
  },
  {
    id: "pulse",
    name: "Pulse Electric",
    category: "Electric",
    edition: "The future collection",
    seats: 4,
    bags: 3,
    power: "Electric",
    transmission: "Single speed",
    description:
      "A different kind of energy. Seamless acceleration meets a thoughtful, quietly expressive interior.",
    mood: "For a new direction",
    color: "#a9a4c4",
    kind: "sedan",
    image: "",
  },
  {
    id: "vista",
    name: "Vista Open",
    category: "Open top",
    edition: "The open-air collection",
    seats: 2,
    bags: 1,
    power: "Performance",
    transmission: "Automatic",
    description:
      "Less between you and the horizon. The scenic route has never felt quite so inviting.",
    mood: "For the horizon",
    color: "#c7a192",
    kind: "coupe",
    image: "",
  },
  {
    id: "suite",
    name: "Suite Van",
    category: "Group travel",
    edition: "The together collection",
    seats: 7,
    bags: 6,
    power: "Touring",
    transmission: "Automatic",
    description:
      "Your own space between destinations. A lounge-inspired journey designed to bring everyone together.",
    mood: "For the company",
    color: "#b4b4aa",
    kind: "van",
    image: "",
  },
];
export const categories = [
  "All vehicles",
  ...new Set(vehicles.map((v) => v.category)),
];
export const experiences = [
  {
    id: "city",
    title: "The city, after hours.",
    subtitle: "City & nightlife",
    number: "01",
    kind: "city",
    copy: "Dinner reservations, an unhurried drive, and a final destination worth dressing for. Build an evening around the way you want to feel.",
    duration: "An evening",
    vehicle: "noir",
  },
  {
    id: "escape",
    title: "Take the longer way.",
    subtitle: "Weekend escapes",
    number: "02",
    kind: "landscape",
    copy: "Leave the calendar behind. An open road, a beautifully chosen vehicle, and time to discover what is around the next bend.",
    duration: "A weekend",
    vehicle: "apex",
  },
  {
    id: "occasion",
    title: "Make an entrance.",
    subtitle: "Celebrations & occasions",
    number: "03",
    kind: "architecture",
    copy: "A milestone deserves its own sense of occasion. Thoughtful details and a memorable arrival, shaped around your moment.",
    duration: "Your occasion",
    vehicle: "atlas",
  },
  {
    id: "business",
    title: "A quieter kind of business.",
    subtitle: "Executive travel",
    number: "04",
    kind: "interior",
    copy: "Create space between the meetings. A composed, considered travel experience that keeps the day moving on your terms.",
    duration: "Your schedule",
    vehicle: "suite",
  },
] as const;
export const documentGroups = [
  {
    id: "vehicle-guides",
    name: "Vehicle guides",
    number: "01",
    description:
      "Explore the collection, compare specifications, and get familiar with your vehicle.",
    icon: "car",
    docs: [
      {
        id: "collection-overview",
        title: "Collection overview",
        description: "A complete introduction to the placeholder fleet.",
        pages: "Overview",
      },
      {
        id: "vehicle-specifications",
        title: "Vehicle specifications",
        description: "A framework for dimensions, features, and capacity.",
        pages: "Reference",
      },
      {
        id: "delivery-checklist",
        title: "Delivery checklist",
        description: "The details to review before the journey begins.",
        pages: "Checklist",
      },
    ],
  },
  {
    id: "booking-options",
    name: "Booking options",
    number: "02",
    description:
      "Compare self-drive, chauffeured, and extended experiences, all in one place.",
    icon: "key",
    docs: [
      {
        id: "self-drive",
        title: "Self-drive experience",
        description:
          "Your route. Your pace. A template for independent journeys.",
        pages: "Option guide",
      },
      {
        id: "chauffeured",
        title: "Chauffeured experience",
        description: "A template for arrivals with a dedicated driver.",
        pages: "Option guide",
      },
      {
        id: "extended",
        title: "Extended journeys",
        description: "A flexible framework for multi-day travel.",
        pages: "Option guide",
      },
    ],
  },
  {
    id: "protection",
    name: "Protection & care",
    number: "03",
    description:
      "Space for approved coverage details, vehicle care, and support information.",
    icon: "shield",
    docs: [
      {
        id: "coverage-overview",
        title: "Coverage overview",
        description: "An empty framework for verified provider coverage.",
        pages: "Provider template",
      },
      {
        id: "vehicle-care",
        title: "Vehicle care guide",
        description: "An editorial template for looking after your vehicle.",
        pages: "Care guide",
      },
      {
        id: "support",
        title: "On-the-road support",
        description: "Contact and escalation fields, ready to be populated.",
        pages: "Contact template",
      },
    ],
  },
  {
    id: "policies",
    name: "Policies & essentials",
    number: "04",
    description:
      "Placeholder spaces for reviewed terms, privacy information, and important details.",
    icon: "file",
    docs: [
      {
        id: "terms-template",
        title: "Booking terms",
        description: "A document structure awaiting approved business terms.",
        pages: "Draft template",
      },
      {
        id: "privacy-template",
        title: "Privacy information",
        description: "A structure for the eventual data-handling policy.",
        pages: "Draft template",
      },
      {
        id: "change-template",
        title: "Changes & cancellations",
        description: "Fields for approved change and cancellation conditions.",
        pages: "Draft template",
      },
    ],
  },
];
export type DocumentGroup = (typeof documentGroups)[number];
export const media = {
  heroVideo: "",
  heroPoster: "",
  brandVideo: "",
  brandPoster: "",
  experienceImages: {
    city: "",
    escape: "",
    occasion: "",
    business: "",
  } as Record<string, string>,
};
export const faqs = [
  [
    "Can I book a vehicle on this website?",
    "This is a working front-end concept. You can explore the collection and build a journey brief, but no reservation, payment, email, or external submission is made.",
  ],
  [
    "Are the vehicles and specifications real?",
    "Every vehicle name, specification, image area, and video area is placeholder content. Replace them with verified information before launch.",
  ],
  [
    "What happens to my journey details?",
    "Your draft stays in memory while this page is open. Nothing is transmitted. Saved vehicle IDs and display preferences are stored only in this browser.",
  ],
  [
    "Where can I review the available options?",
    "Visit Documents for vehicle guides, booking options, protection and care, and policy templates. All sample downloads are clearly labeled draft placeholders.",
  ],
];
