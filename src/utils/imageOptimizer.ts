/**
 * Client-side image optimization and processing utility.
 * Resizes large user-created images to standard high-definition publishing dimensions
 * and converts them to optimized WebP/JPEG data URLs to fit smoothly in Firestore and LocalStorage.
 */

export interface OptimizedImageResult {
  dataUrl: string;
  fileName: string;
  originalSize: number; // bytes
  optimizedSize: number; // bytes
  width: number;
  height: number;
  format: string;
}

export async function processAndOptimizeImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1200,
  quality = 0.85
): Promise<OptimizedImageResult> {
  return new Promise((resolve, reject) => {
    // If SVG, read directly as data URL without rasterizing
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve({
          dataUrl,
          fileName: file.name,
          originalSize: file.size,
          optimizedSize: file.size,
          width: 800,
          height: 600,
          format: 'svg',
        });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image file for optimization'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale down if larger than max boundaries while preserving aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          // Fallback to original data URL if canvas context fails
          resolve({
            dataUrl: reader.result as string,
            fileName: file.name,
            originalSize: file.size,
            optimizedSize: file.size,
            width: img.width,
            height: img.height,
            format: file.type,
          });
          return;
        }

        // Draw image with smooth scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG
        let dataUrl: string;
        let format = 'webp';
        try {
          dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
            format = 'jpeg';
          }
        } catch {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
          format = 'jpeg';
        }

        // Calculate approximate size in bytes from base64
        const head = dataUrl.indexOf(',') + 1;
        const base64Length = dataUrl.length - head;
        const optimizedSize = Math.round((base64Length * 3) / 4);

        resolve({
          dataUrl,
          fileName: file.name,
          originalSize: file.size,
          optimizedSize,
          width,
          height,
          format,
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
