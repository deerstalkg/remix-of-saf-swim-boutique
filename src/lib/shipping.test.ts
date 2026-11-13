import { describe, expect, it } from "vitest";
import { calculateShipping, calculateTotals, shippingMethodsFor } from "./shipping";

describe("shipping rules", () => {
  it("charges £4.95 UK standard below £150", () => {
    expect(calculateShipping("uk-standard", 14999, "GB")).toBe(495);
  });
  it("makes UK standard free from £150", () => {
    expect(calculateShipping("uk-standard", 15000, "GB")).toBe(0);
  });
  it("always charges £9.95 for UK express", () => {
    expect(calculateShipping("uk-express", 50000, "GB")).toBe(995);
  });
  it("charges £14.95 international", () => {
    expect(calculateShipping("international", 50000, "FR")).toBe(1495);
  });
  it("only offers international delivery outside the UK", () => {
    expect(shippingMethodsFor("US").map((m) => m.id)).toEqual(["international"]);
    expect(() => calculateShipping("uk-standard", 1000, "US")).toThrow();
  });
  it("adds line totals and shipping", () => {
    const t = calculateTotals([{ unitPricePence: 6500, quantity: 2 }], "uk-standard", "GB");
    expect(t).toEqual({ subtotalPence: 13000, shippingPence: 495, totalPence: 13495 });
  });
});
