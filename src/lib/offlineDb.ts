// IndexedDB layer for offline queues (check-ins, media uploads)
// Uses raw IndexedDB (no dependencies) for maximum compatibility

const DB_NAME = 'forge_offline';
const DB_VERSION = 2;

export interface PendingCheckIn {
  id: string;
  date: string;
  payload: Record<string, any>;
  failedItems: Record<string, any>[];
  createdAt: string;
  synced: boolean;
}

export interface PendingMedia {
  id: string;
  date: string;
  type: 'video' | 'audio';
  blob: Blob;
  filePath: string;
  userId: string;
  createdAt: string;
  synced: boolean;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('pending_checkins')) {
        db.createObjectStore('pending_checkins', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pending_media')) {
        db.createObjectStore('pending_media', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('offline_cache')) {
        db.createObjectStore('offline_cache', { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// --- PENDING CHECK-INS ---

export async function queueCheckIn(checkin: PendingCheckIn): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending_checkins', 'readwrite');
    tx.objectStore('pending_checkins').put(checkin);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingCheckIns(): Promise<PendingCheckIn[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending_checkins', 'readonly');
    const req = tx.objectStore('pending_checkins').getAll();
    req.onsuccess = () => resolve((req.result || []).filter((c: PendingCheckIn) => !c.synced));
    req.onerror = () => reject(req.error);
  });
}

export async function markCheckInSynced(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending_checkins', 'readwrite');
    const store = tx.objectStore('pending_checkins');
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      if (getReq.result) {
        store.put({ ...getReq.result, synced: true });
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// --- PENDING MEDIA ---

export async function queueMedia(media: PendingMedia): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending_media', 'readwrite');
    tx.objectStore('pending_media').put(media);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingMedia(): Promise<PendingMedia[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending_media', 'readonly');
    const req = tx.objectStore('pending_media').getAll();
    req.onsuccess = () => resolve((req.result || []).filter((m: PendingMedia) => !m.synced));
    req.onerror = () => reject(req.error);
  });
}

export async function markMediaSynced(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending_media', 'readwrite');
    const store = tx.objectStore('pending_media');
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      if (getReq.result) {
        store.put({ ...getReq.result, synced: true });
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// --- GENERIC OFFLINE CACHE (for floor data, etc.) ---

export async function setCacheItem(key: string, value: any): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_cache', 'readwrite');
    tx.objectStore('offline_cache').put({ key, value, updatedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCacheItem<T = any>(key: string): Promise<T | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_cache', 'readonly');
    const req = tx.objectStore('offline_cache').get(key);
    req.onsuccess = () => resolve(req.result?.value ?? null);
    req.onerror = () => reject(req.error);
  });
}
