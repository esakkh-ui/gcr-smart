/**
 * Compresses an uploaded or camera-captured photo (KTP / KK) into a crisp JPEG data URL
 * guaranteed to fit comfortably within Firestore document size limits (<350KB per photo).
 */
export async function compressIdentityImage(file: File, maxChars = 350000): Promise<string> {
  const isImageFile =
    file.type.startsWith('image/') || /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(file.name);
  if (!isImageFile) {
    throw new Error('Mohon pilih file berupa foto/gambar (JPG, PNG, JPEG, WEBP, atau HEIC).');
  }

  if (file.size > 15 * 1024 * 1024) {
    throw new Error('Ukuran file foto maksimal 15 MB.');
  }

  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Gagal membaca file gambar.'));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error('Format gambar tidak didukung perangkat ini. Silakan gunakan foto JPG/PNG.'));
    image.src = rawDataUrl;
  });

  const attempts: Array<{ maxDim: number; quality: number }> = [
    { maxDim: 960, quality: 0.7 },
    { maxDim: 820, quality: 0.58 },
    { maxDim: 680, quality: 0.48 },
    { maxDim: 540, quality: 0.4 },
  ];

  for (const { maxDim, quality } of attempts) {
    let { width, height } = img;
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.max(1, Math.round((height * maxDim) / width));
        width = maxDim;
      } else {
        width = Math.max(1, Math.round((width * maxDim) / height));
        height = maxDim;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) break;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const compressed = canvas.toDataURL('image/jpeg', quality);
    if (compressed.length <= maxChars) {
      return compressed;
    }
  }

  throw new Error('Ukuran foto terlalu besar setelah dikompresi. Silakan ambil ulang foto dengan resolusi standar.');
}
