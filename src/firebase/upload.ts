import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './config';

export async function uploadSingleFile(file: File, pathPrefix: string): Promise<string> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const storagePath = `${pathPrefix}/${timestamp}-${safeName}`;
  const storageRef = ref(storage, storagePath);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return url;
}

export async function uploadMultipleFiles(files: File[], pathPrefix: string): Promise<string[]> {
  const uploads = files.map((file) => uploadSingleFile(file, pathPrefix));
  return Promise.all(uploads);
}




