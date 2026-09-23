import { it, expect } from "vitest";
import { formatPrice } from "@/lib/format";

it("formats CAD", () => {
  expect(formatPrice(12.9)).toBe("$12.90");
  expect(formatPrice(1234.5)).toBe("$1,234.50");
});

import { groupHours, formatTime } from "@/lib/format";

it("formats 24h time as 12h", () => {
  expect(formatTime("09:00")).toBe("9:00 AM");
  expect(formatTime("20:30")).toBe("8:30 PM");
  expect(formatTime("12:00")).toBe("12:00 PM");
});

it("groups consecutive days with the same hours", () => {
  const day = (d: string, open = "09:00", close = "20:00", closed = false) => ({ day: d, open, close, closed });
  expect(
    groupHours([
      day("Monday"), day("Tuesday"), day("Wednesday"), day("Thursday"), day("Friday"),
      day("Saturday", "09:00", "21:00"), day("Sunday", "", "", true),
    ]),
  ).toEqual([
    { label: "Monday – Friday", value: "9:00 AM – 8:00 PM" },
    { label: "Saturday", value: "9:00 AM – 9:00 PM" },
    { label: "Sunday", value: "Closed" },
  ]);
});
