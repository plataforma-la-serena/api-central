export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const SIGNATURES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
};

/**
 * Valida el tipo real de la imagen por magic bytes, no por la extensión ni por
 * el Content-Type que declara el cliente.
 */
export function looksLikeImage(data: Uint8Array, mimeType: string): boolean {
  const signature = SIGNATURES[mimeType];
  if (!signature) {
    return false;
  }
  return signature.every((byte, index) => data[index] === byte);
}
