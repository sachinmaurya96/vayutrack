import type { StepDef } from "@/components/forms/SchemaForm";
import { services } from "./services";

/** Option lists and form definitions. Field names follow the current site's forms. */

export const indianStates = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
].map((s) => ({ value: s, label: s }));

export const countries = ["India", "United States", "United Kingdom", "Canada", "Australia", "Other"].map((c) => ({ value: c, label: c }));

const addressFields = (prefix: string, who: string) =>
  [
    { name: `${prefix}_address`, label: "Address", required: true, span: "full", autoComplete: "street-address", placeholder: "House / building, street, area" },
    { name: `${prefix}_city`, label: "City", required: true, autoComplete: "address-level2" },
    { name: `${prefix}_state`, label: "State", type: "select", required: true, options: indianStates, autoComplete: "address-level1" },
    { name: `${prefix}_pincode`, label: "Pincode", required: true, format: "pincode", inputMode: "numeric", autoComplete: "postal-code", hint: `6-digit pincode of the ${who}` },
  ] as const;

export const bookingSteps: StepDef[] = [
  {
    id: "shipment",
    title: "Shipment",
    description: "Choose a service and tell us what you are sending.",
    fields: [
      {
        name: "service",
        label: "Service",
        type: "choice",
        required: true,
        span: "full",
        options: [
          ...services.map((s) => ({ value: s.mode, label: s.name, description: s.short })),
          { value: "unsure", label: "Not sure", description: "Our team will suggest one" },
        ],
      },
      {
        name: "shipment_type",
        label: "What are you sending?",
        type: "choice",
        required: true,
        span: "full",
        options: [
          { value: "documents", label: "Documents" },
          { value: "parcel", label: "Parcel" },
          { value: "pallet", label: "Pallet or bulk cargo" },
        ],
      },
      { name: "pickup_date", label: "Preferred pickup date", type: "date", hint: "Optional. Our team confirms the final pickup slot." },
    ],
  },
  {
    id: "sender",
    title: "Sender",
    description: "Who is sending the shipment, and where should we collect it?",
    fields: [
      { name: "consignor_name", label: "Sender name", required: true, autoComplete: "name" },
      { name: "consignor_phone", label: "Phone", type: "tel", required: true, format: "phone", autoComplete: "tel" },
      { name: "consignor_email", label: "Email", type: "email", format: "email", autoComplete: "email", hint: "Optional, for booking updates" },
      ...addressFields("consignor", "pickup address"),
    ],
  },
  {
    id: "receiver",
    title: "Receiver",
    description: "Who is receiving the shipment, and where is it going?",
    fields: [
      { name: "customer_name", label: "Receiver name", required: true },
      { name: "customer_phone", label: "Phone", type: "tel", required: true, format: "phone" },
      { name: "customer_email", label: "Email", type: "email", format: "email", hint: "Optional" },
      ...addressFields("customer", "delivery address"),
    ],
  },
  {
    id: "package",
    title: "Package",
    description: "Details that help us plan handling and vehicle space.",
    fields: [
      { name: "product_name", label: "Contents", required: true, placeholder: "e.g. Documents, clothing, spare parts" },
      { name: "sku", label: "SKU", hint: "Optional, for business orders" },
      { name: "quantity", label: "Quantity", type: "number", required: true, format: "positive", inputMode: "numeric" },
      { name: "weight", label: "Total weight (kg)", type: "number", required: true, format: "positive", inputMode: "decimal" },
      { name: "price", label: "Declared value per item (₹)", type: "number", format: "positive", inputMode: "decimal", hint: "Optional" },
      { name: "dimensions", label: "Dimensions (cm, L × W × H)", placeholder: "e.g. 30 × 20 × 15", hint: "Optional" },
      {
        name: "handling_type",
        label: "Handling",
        type: "select",
        options: ["Normal", "Fragile", "Liquid", "Chemical", "Heavy"].map((v) => ({ value: v, label: v })),
      },
      {
        name: "payment_method",
        label: "Payment method",
        type: "select",
        options: ["Prepaid", "Cash on Delivery", "Bank Transfer", "UPI"].map((v) => ({ value: v, label: v })),
      },
      {
        name: "is_liquid",
        label: "Does the shipment contain liquid?",
        type: "choice",
        span: "full",
        compact: true,
        options: [
          { value: "no", label: "No" },
          { value: "yes", label: "Yes" },
        ],
      },
      { name: "source", label: "Order source", placeholder: "e.g. Website, marketplace, direct", hint: "Optional, for ecommerce orders" },
      { name: "order_notes", label: "Notes for our team", type: "textarea", span: "full", placeholder: "Pickup instructions, delivery timing, anything we should know" },
    ],
  },
];

export const businessEnquirySteps: StepDef[] = [
  {
    id: "business",
    title: "Business enquiry",
    fields: [
      { name: "name", label: "Your name", required: true, autoComplete: "name" },
      { name: "organization", label: "Organisation", required: true, autoComplete: "organization" },
      { name: "email", label: "Work email", type: "email", required: true, format: "email", autoComplete: "email" },
      { name: "mobile", label: "Mobile", type: "tel", required: true, format: "phone", autoComplete: "tel" },
      { name: "contact", label: "Alternate phone", type: "tel", format: "phone", hint: "Optional" },
      { name: "website", label: "Website", type: "url", format: "url", placeholder: "example.com", hint: "Optional" },
      {
        name: "customer_type",
        label: "What describes your business?",
        type: "choice",
        required: true,
        span: "full",
        options: [
          { value: "Corporate Customer", label: "Corporate", description: "Regular office and business shipments" },
          { value: "Domestic Express", label: "Domestic express", description: "Parcels moving within India" },
          { value: "Ecommerce Customer", label: "Ecommerce", description: "Orders shipped to your customers" },
        ],
      },
      {
        name: "enquiry_type",
        label: "Where will you ship?",
        type: "choice",
        required: true,
        span: "full",
        compact: true,
        options: [
          { value: "Within India", label: "Within India" },
          { value: "Cross Border", label: "Cross border" },
        ],
      },
      { name: "address", label: "Address", span: "full", autoComplete: "street-address" },
      { name: "address2", label: "Address line 2", span: "full", hint: "Optional" },
      { name: "city", label: "City", required: true, autoComplete: "address-level2" },
      { name: "state", label: "State", type: "select", options: indianStates, autoComplete: "address-level1" },
      { name: "pincode", label: "Pincode", format: "pincode", inputMode: "numeric", autoComplete: "postal-code" },
      { name: "country", label: "Country", type: "select", required: true, options: countries, autoComplete: "country-name" },
      { name: "current_bill", label: "Current courier spend per month (₹)", type: "number", format: "positive", inputMode: "numeric", hint: "Optional" },
      { name: "expected_business", label: "Expected shipping per month (₹)", type: "number", format: "positive", inputMode: "numeric", hint: "Optional" },
      { name: "message", label: "Anything else we should know?", type: "textarea", span: "full", hint: "Optional: lanes, volumes, special handling" },
    ],
  },
];

export const partnerSteps: StepDef[] = [
  {
    id: "partner",
    title: "Partner details",
    fields: [
      { name: "full_name", label: "Full name", required: true, autoComplete: "name", span: "full" },
      { name: "email", label: "Email", type: "email", required: true, format: "email", autoComplete: "email" },
      { name: "phone", label: "Phone", type: "tel", required: true, format: "phone", autoComplete: "tel" },
      { name: "country", label: "Country", type: "select", required: true, options: countries, autoComplete: "country-name" },
      { name: "state", label: "State", type: "select", required: true, options: indianStates, autoComplete: "address-level1" },
      { name: "city", label: "City", required: true, autoComplete: "address-level2" },
      { name: "pincode", label: "Pincode", required: true, format: "pincode", inputMode: "numeric", autoComplete: "postal-code" },
      { name: "about", label: "Tell us about yourself", type: "textarea", span: "full", hint: "Optional: your background and the area you would like to cover" },
    ],
  },
];

export const contactSteps: StepDef[] = [
  {
    id: "message",
    title: "Message",
    fields: [
      { name: "name", label: "Name", required: true, autoComplete: "name" },
      { name: "email", label: "Email", type: "email", required: true, format: "email", autoComplete: "email" },
      { name: "phone", label: "Phone", type: "tel", format: "phone", autoComplete: "tel", hint: "Optional" },
      { name: "subject", label: "Subject", required: true },
      { name: "message", label: "Message", type: "textarea", required: true, span: "full" },
    ],
  },
];

export const applicationSteps: StepDef[] = [
  {
    id: "application",
    title: "Application",
    fields: [
      { name: "full_name", label: "Full name", required: true, autoComplete: "name", span: "full" },
      { name: "email", label: "Email", type: "email", required: true, format: "email", autoComplete: "email" },
      { name: "phone", label: "Phone", type: "tel", required: true, format: "phone", autoComplete: "tel" },
      { name: "note", label: "Note", type: "textarea", span: "full", hint: "Optional: experience, availability or a link to your CV" },
    ],
  },
];
