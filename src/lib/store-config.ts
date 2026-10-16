export const STORE_NAME = "Skyvix";
export const STORE_ADDRESS = "Quaid Commercial, Precinct 02, Bahria Town Karachi, Karachi, Sindh, Pakistan";
export const DELIVERY_AREA = "Bahria Town Karachi";

export function isDeliverableAddress(address: string, city: string) {
  return /\bbahria\s+town\b/i.test(address) && city.trim().toLowerCase() === "karachi";
}