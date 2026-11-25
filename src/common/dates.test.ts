import { describe, expect, it } from "vitest";
import { addDays, assertDateRange, nightsBetween, toIsoDate } from "./dates";

describe("dates", () => {
  it("suma días en UTC sin corrimientos de zona", () => {
    const start = new Date(Date.UTC(2026, 11, 15));
    expect(toIsoDate(addDays(start, 5))).toBe("2026-12-20");
  });

  it("cuenta noches entre dos fechas", () => {
    const start = new Date(Date.UTC(2026, 11, 15));
    const end = new Date(Date.UTC(2026, 11, 18));
    expect(nightsBetween(start, end)).toBe(3);
  });

  it("nunca devuelve noches negativas", () => {
    const start = new Date(Date.UTC(2026, 11, 18));
    const end = new Date(Date.UTC(2026, 11, 15));
    expect(nightsBetween(start, end)).toBe(0);
  });

  it("rechaza fechas inválidas", () => {
    expect(() =>
      assertDateRange(new Date("no-es-fecha"), new Date()),
    ).toThrow("Fecha inválida");
  });

  it("rechaza un rango donde el fin no es posterior al inicio", () => {
    const sameDay = new Date(Date.UTC(2026, 11, 15));
    expect(() => assertDateRange(sameDay, sameDay)).toThrow(
      "La fecha de inicio debe ser anterior a la de fin",
    );
  });
});
