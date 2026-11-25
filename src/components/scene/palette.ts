/** Scene colours shared by the WebGL world and the SVG fallback. */
export const PALETTE = {
  page: "#f5f8fd",
  ground: "#eaeff8",
  grass: "#dfeee6",
  apron: "#e1e7f1",
  road: "#d3dcea",
  roadEdge: "#c4cfe2",
  sidewalk: "#f9fbfe",
  laneMark: "#ffffff",
  bayLine: "#e9b44c",

  hubWall: "#2f6ae8",
  hubTrim: "#f7faff",
  hubRoof: "#3f7cf2",
  hubRoofRib: "#2d63da",
  door: "#e5ebf4",
  doorLine: "#cdd7e6",
  doorOpen: "#1d2d4b",
  canopy: "#f4f7fc",
  bumper: "#2a3446",

  annex: "#f8fafd",
  glass: "#a3c2f6",
  glassDark: "#2a4b87",

  truckBody: "#ffffff",
  truckCab: "#0a2c4e",
  truckStripe: "#bc2230",
  otherCab: "#9fb6d9",
  otherBody: "#f1f4f9",
  tyre: "#232d3d",
  chassis: "#3a4659",
  windscreen: "#1b2d4a",

  cardboard: "#d6a66a",
  cardboardDark: "#bf8d52",
  tape: "#ecca96",
  pallet: "#c99d6a",
  wrapBlue: "#4b80ea",

  forklift: "#f0ad1c",
  mast: "#384457",

  treeCrown: "#5db27b",
  treeCrownLight: "#79c793",
  trunk: "#97a4b8",
  hedge: "#6dbb88",

  house: "#ffffff",
  houseRoof: "#4a6cad",
  houseDoor: "#0f3660",
  destWall: "#f7f9fc",
  destGlass: "#a9c6f6",
  destCanopy: "#0a2c4e",

  city: "#f2f5fa",
  cityRoof: "#e0e7f2",
  cityWindow: "#cfdcf0",

  water: "#a8c5f4",
  waterEdge: "#c4d8f8",
  quay: "#e2e8f1",

  aircraft: "#ffffff",
  aircraftGrey: "#b7c4d8",
  engine: "#5a6a82",
  uld: "#d3dae5",
  tug: "#2563eb",
  runway: "#cbd4e3",

  hull: "#1f3b63",
  hullBoot: "#b03a47",
  deck: "#c3ccda",
  superstructure: "#ffffff",
  crane: "#2563eb",
  craneLight: "#f2f5fa",
  containers: ["#0a2c4e", "#2563eb", "#bc2230", "#eef2f8", "#8fb0ef", "#5e7a9a", "#e9b44c", "#2f6ae8"],

  highlight: "#2563eb",
  pin: "#2563eb",
  success: "#16a34a",
} as const;

/** Mix a hex colour towards white (amount > 0) or black (amount < 0). */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  if (amount >= 0) {
    r += (255 - r) * amount;
    g += (255 - g) * amount;
    b += (255 - b) * amount;
  } else {
    r *= 1 + amount;
    g *= 1 + amount;
    b *= 1 + amount;
  }
  const h = (v: number) => Math.round(v).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}
