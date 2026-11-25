/**
 * About and culture content, adapted from the current About and Life pages.
 * Coverage statistics and unattributed staff quotes are left out pending
 * client approval.
 */

export const about = {
  eyebrow: "About us",
  title: "Delivering trust with every shipment.",
  lead: "VayuTrack is a courier and delivery company focused on secure, dependable logistics. We help individuals and businesses deliver parcels, documents and shipments to their destinations with care and professionalism.",
  who: {
    eyebrow: "Who we are",
    heading: "A strong network for a stronger tomorrow.",
    paragraphs: [
      "Our focus is on timely deliveries, customer satisfaction and transparent service. With a commitment to reliability and operational excellence, we aim to simplify the delivery experience and build lasting relationships with our customers.",
      "At VayuTrack, every delivery matters. We don’t just deliver packages — we deliver trust, convenience and peace of mind.",
    ],
    tagline: "Your trusted partner in every delivery.",
  },
  focus: [
    { title: "Secure handling", body: "Your shipments stay in safe hands from pickup to handover." },
    { title: "Respect for your time", body: "We plan around your timelines and keep you informed along the way." },
    { title: "For every kind of sender", body: "Individuals, businesses and ecommerce brands." },
    { title: "Transparent service", body: "Clear information about what is booked and how it is moving." },
  ],
  leadership: {
    eyebrow: "Our leadership",
    heading: "The minds behind the movement.",
    body: "Our directors bring vision, experience and a strong commitment to building a reliable, customer-focused logistics network.",
    people: [
      { name: "Priya Sheoran", role: "Director", initials: "PS" },
      { name: "Sumesh Sheoran", role: "Director", initials: "SS" },
    ],
  },
} as const;

export const life = {
  eyebrow: "Life at VayuTrack",
  title: "Join the VayuTrack family.",
  lead: "People move every shipment. This is a workplace where the route you own is visible, your ideas reach the desk that can use them, and the shift still leaves room for a life outside the hub.",
  culture: {
    eyebrow: "Our culture",
    heading: "One network. One standard.",
    paragraphs: [
      "VayuTrack is not a stack of separate desks. Pickup, linehaul and customer care share one tracking record, and the people on those desks share the same standard: say what the shipment is doing, and do that thing.",
      "The floor is busy. The expectation is still simple. Ask when a bag is unclear, help the next shift, and leave the status honest.",
    ],
    different: [
      "Teams get a lane they can run, with the tracking tools to see it",
      "Shifts are planned so a peak week does not erase the next day off",
      "New joiners learn the hub, the AWB and the customer call before they are left alone with a route",
      "A better scan, a clearer handover or a safer load is welcome from any desk",
      "Hubs hire locally and the head office sits with operations, not above them",
    ],
  },
  values: [
    { title: "Integrity", body: "The status on the AWB matches the bag. We do not dress up a delay." },
    { title: "Teamwork", body: "A missed connection is a shared problem. The next desk picks it up instead of passing blame." },
    { title: "Innovation", body: "If a scan, a route or a call script can be shorter and clearer, we change it." },
    { title: "Excellence", body: "On time is the aim. Careful handling is how we get there." },
    { title: "Compassion", body: "The person waiting for the parcel, and the person carrying it, both get a straight answer." },
    { title: "Responsibility", body: "If you booked it, scanned it or promised it, you stay with it until it is done." },
  ],
  programmes: [
    { title: "Wellness", body: "Health checks, basic fitness time, and a clear path to talk when a shift has been too heavy." },
    { title: "Recognition", body: "A clean delivery, a recovered bag or a customer saved from a wrong promise gets named in the team." },
    { title: "Time together", body: "Festival days, hub games and the occasional outing. The team should know each other." },
    { title: "Open desk", body: "A rider, a sorter or a support executive can take a problem to the shift lead directly." },
    { title: "Learning", body: "Hub induction, customer-call practice, and a path from the floor into team lead." },
    { title: "Balance", body: "Paid leave and rosters published ahead of the week, so family plans are not a surprise." },
  ],
  growth: {
    eyebrow: "Growth",
    heading: "Grow with the network.",
    body: "A role at VayuTrack can move from a route to a hub, from the phone desk to key accounts, or from a city team into the head office. The path is written down, and the next opening is posted inside before it is posted outside.",
    points: [
      "A named lead for the first ninety days",
      "Shift-lead and hub-lead practice for people who want it",
      "Time on another desk so sales, care and operations have seen each other’s work",
      "Internal openings listed before public hiring",
      "Reviews that talk about the next role, not only last month’s count",
    ],
  },
} as const;
