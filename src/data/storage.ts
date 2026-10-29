import { getStorage } from 'firebase/storage';
import { app } from './firebase';
import { storageEnabled } from '../config';
if (!storageEnabled) throw new Error('La subida de fotos todavía no está habilitada.');
export const storage = getStorage(app);
