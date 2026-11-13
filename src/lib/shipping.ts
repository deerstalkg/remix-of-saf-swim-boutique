/**
 * Shipping rules shared by the bag, checkout and the order server function.
 * Rates are placeholders until Summer confirms her real delivery pricing.
 */
export type ShippingMethodId = "uk-standard" | "uk-express" | "international";

export const UK_COUNTRY_CODE = "GB";
export const FREE_UK_SHIPPING_THRESHOLD_PENCE = 15000; // £150

export interface ShippingMethod {
  id: ShippingMethodId;
  label: string;
  eta: string;
  pricePence: number;
  region: "UK" | "INTL";
}

export const SHIPPING_METHODS: ShippingMethod[] = [
  { id: "uk-standard", label: "UK Standard", eta: "3–5 working days", pricePence: 495, region: "UK" },
  { id: "uk-express", label: "UK Express", eta: "1–2 working days", pricePence: 995, region: "UK" },
  { id: "international", label: "International", eta: "5–10 working days", pricePence: 1495, region: "INTL" },
];

export const COUNTRIES: { code: string; name: string }[] = [
  { code: "GB", name: "United Kingdom" },
  { code: "IE", name: "Ireland" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "DE", name: "Germany" },
  { code: "NL", name: "Netherlands" },
  { code: "GR", name: "Greece" },
  { code: "PT", name: "Portugal" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "AU", name: "Australia" },
  { code: "PK", name: "Pakistan" },
];

export function shippingMethodsFor(country: string): ShippingMethod[] {
  const region = country === UK_COUNTRY_CODE ? "UK" : "INTL";
  return SHIPPING_METHODS.filter((m) => m.region === region);
}

export function calculateShipping(methodId: ShippingMethodId, subtotalPence: number, country: string): number {
  const method = shippingMethodsFor(country).find((m) => m.id === methodId);
  if (!method) throw new Error("This delivery option isn't available for the selected country.");
  if (subtotalPence <= 0) return 0;
  if (method.id === "uk-standard" && subtotalPence >= FREE_UK_SHIPPING_THRESHOLD_PENCE) return 0;
  return method.pricePence;
}

export function calculateSubtotal(lines: { unitPricePence: number; quantity: number }[]): number {
  return lines.reduce((sum, l) => sum + l.unitPricePence * l.quantity, 0);
}

export function calculateTotals(
  lines: { unitPricePence: number; quantity: number }[],
  methodId: ShippingMethodId,
  country: string,
) {
  const subtotalPence = calculateSubtotal(lines);
  const shippingPence = calculateShipping(methodId, subtotalPence, country);
  return { subtotalPence, shippingPence, totalPence: subtotalPence + shippingPence };
}

export function amountToFreeShipping(subtotalPence: number): number {
  return Math.max(0, FREE_UK_SHIPPING_THRESHOLD_PENCE - subtotalPence);
}
