import { formatClientDate } from "../formatClientDate";

describe("formatClientDate", () => {
    it("formats an iso date using the provided pattern", () => {
        expect(formatClientDate("2026-04-24T12:34:00", "p")).toBe("12:34 PM");
    });

    it("supports non-time patterns as well", () => {
        expect(formatClientDate("2026-04-24T12:34:00", "PP")).toBe("Apr 24, 2026");
    });
});
