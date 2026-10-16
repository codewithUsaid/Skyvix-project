import { test, expect } from "vitest";
import { STORE_ADDRESS, isDeliverableAddress } from "./store-config";

test("store uses the requested Quaid Commercial address", () => {
  expect(STORE_ADDRESS).toBe("Quaid Commercial, Precinct 02, Bahria Town Karachi, Karachi, Sindh, Pakistan");
});
test("delivery is restricted to Bahria Town Karachi", () => {
  expect(isDeliverableAddress("House 10, Precinct 2, Bahria Town Karachi", "Karachi")).toBe(true);
  expect(isDeliverableAddress("House 10, DHA Karachi", "Karachi")).toBe(false);
  expect(isDeliverableAddress("Bahria Town Lahore", "Lahore")).toBe(false);
});