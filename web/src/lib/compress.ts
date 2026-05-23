import imageCompression from 'browser-image-compression';

export async function compressPhoto(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 0.9,
    maxWidthOrHeight: 800,
    useWebWorker: true,
    fileType: 'image/jpeg',
  });
}
