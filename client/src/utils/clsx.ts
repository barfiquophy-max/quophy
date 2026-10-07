export function clsx(...args: (string | false | null | undefined)[]): string {
  return args.filter(Boolean).join(' ');
}

export function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function fmtDateTime(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Compress an image file to JPEG under maxBytes before upload. */
export async function compressImage(file: File, maxBytes = 900_000, maxDim = 1600): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  const img = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  let quality = 0.85;
  let blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', quality));
  while (blob && blob.size > maxBytes && quality > 0.35) {
    quality -= 0.15;
    blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', quality));
  }
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
}
