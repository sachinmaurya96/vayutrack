/**
 * Open roles as listed on the current careers page (25 Nov 2026).
 * PENDING CLIENT CONFIRMATION: openings, pay and locations change; confirm
 * before launch.
 */

export type JobType = "Full Time" | "Part Time";

export type Job = {
  slug: string;
  title: string;
  type: JobType;
  location: string;
  experience: string;
  pay: string;
  summary: string;
  details: string[];
};

export const jobs: Job[] = [
  {
    slug: "delivery-driver",
    title: "Delivery Driver",
    type: "Full Time",
    location: "Mumbai, Maharashtra",
    experience: "1–3 years",
    pay: "₹20,000–₹30,000/month",
    summary: "Handle package deliveries on assigned routes and make sure every handover goes smoothly.",
    details: [
      "You will pick up and deliver shipments on assigned routes, confirm each handoff, and keep the tracking status current.",
      "A valid driving licence and comfort with city routes are required.",
    ],
  },
  {
    slug: "warehouse-manager",
    title: "Warehouse Manager",
    type: "Full Time",
    location: "Delhi, Delhi",
    experience: "3–5 years",
    pay: "₹40,000–₹55,000/month",
    summary: "Run warehouse operations, oversee inventory and coordinate with the logistics team.",
    details: [
      "You will run inbound and outbound scans, plan the floor, and keep dispatch on time.",
      "Experience with a courier hub or warehouse is preferred.",
    ],
  },
  {
    slug: "customer-support-executive",
    title: "Customer Support Executive",
    type: "Full Time",
    location: "Bangalore, Karnataka",
    experience: "0–2 years",
    pay: "₹18,000–₹25,000/month",
    summary: "Help customers by phone and email and make sure every query gets a clear answer.",
    details: [
      "You will answer tracking questions, raise tickets, and close the loop with the hub team.",
      "Clear spoken English and Hindi help on this desk.",
    ],
  },
  {
    slug: "hr-manager",
    title: "HR Manager",
    type: "Full Time",
    location: "Pune, Maharashtra",
    experience: "4–6 years",
    pay: "₹45,000–₹60,000/month",
    summary: "Lead recruitment, employee relations and performance management, and shape HR policy.",
    details: [
      "You will hire for hubs and the head office, keep attendance records clean, and support team leads.",
      "Prior HR work in operations or logistics is useful.",
    ],
  },
  {
    slug: "web-developer",
    title: "Web Developer",
    type: "Part Time",
    location: "Hyderabad, Telangana",
    experience: "2–4 years",
    pay: "₹35,000–₹50,000/month",
    summary: "Build and maintain web applications across the frontend and backend.",
    details: [
      "You will improve the public website and the internal tools used by booking and dispatch.",
      "PHP and a modern frontend stack are the day-to-day tools.",
    ],
  },
  {
    slug: "sales-manager",
    title: "Sales Manager",
    type: "Full Time",
    location: "Chennai, Tamil Nadu",
    experience: "3–5 years",
    pay: "₹50,000–₹70,000/month",
    summary: "Drive sales strategy, manage client relationships and lead the sales team.",
    details: [
      "You will open business accounts, follow up on enquiries, and keep monthly shipping targets visible.",
      "A record of B2B logistics sales is preferred.",
    ],
  },
];

export const jobBySlug = Object.fromEntries(jobs.map((j) => [j.slug, j])) as Record<string, Job>;
export const jobLocations = [...new Set(jobs.map((j) => j.location))].sort();
