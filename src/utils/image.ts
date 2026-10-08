/**
 * Reads an image the reader picked and scales it down on-device (like the app
 * does) so it fits comfortably in local storage: covers ~900px, avatars 400px.
 */
export async function fileToDataUrl(file: File, kind: 'cover' | 'avatar'): Promise<string> {
  const max = kind === 'cover' ? 900 : 400;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  let w = Math.round(bitmap.width * scale);
  let h = Math.round(bitmap.height * scale);
  let sx = 0;
  let sy = 0;
  let sw = bitmap.width;
  let sh = bitmap.height;
  if (kind === 'avatar') {
    // centre-crop to a square
    const side = Math.min(bitmap.width, bitmap.height);
    sx = (bitmap.width - side) / 2;
    sy = (bitmap.height - side) / 2;
    sw = sh = side;
    w = h = Math.min(max, side);
  }
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.drawImage(bitmap, sx, sy, sw, sh, 0, 0, w, h);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.8);
}

/** Opens the OS picker. `camera` asks phones to open the camera directly. */
export function pickImage(kind: 'cover' | 'avatar', camera = false): Promise<string | null> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (camera) {
      input.setAttribute('capture', 'environment');
    }
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      try {
        resolve(await fileToDataUrl(file, kind));
      } catch {
        resolve(null);
      }
    };
    input.click();
  });
}
