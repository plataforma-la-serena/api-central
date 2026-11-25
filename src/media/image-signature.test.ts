import { describe, expect, it } from "vitest";
import { looksLikeImage } from "./image-signature";

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00]);
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
const html = new Uint8Array([0x3c, 0x21, 0x44, 0x4f, 0x43]);

describe("looksLikeImage", () => {
  it("acepta JPEG por magic bytes", () => {
    expect(looksLikeImage(jpeg, "image/jpeg")).toBe(true);
  });

  it("acepta PNG por magic bytes", () => {
    expect(looksLikeImage(png, "image/png")).toBe(true);
  });

  it("rechaza un archivo que no es imagen aunque declare un mime válido", () => {
    expect(looksLikeImage(html, "image/png")).toBe(false);
  });

  it("rechaza tipos MIME no permitidos", () => {
    expect(looksLikeImage(png, "image/svg+xml")).toBe(false);
    expect(looksLikeImage(png, "text/html")).toBe(false);
  });
});
