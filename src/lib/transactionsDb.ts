import type { Transaction } from './types';

const DB_NAME = 'expense-dashboard-db';
const DB_VERSION = 1;
const STORE_NAME = 'transactions';
const LEGACY_LOCALSTORAGE_KEY = 'expense-dashboard-transactions-v1';

// A single shared connection is opened once and reused for every operation,
// rather than opening (and never closing) a fresh one per call.
let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = fn(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Reads directly from IndexedDB, with no migration check — used internally. */
function getAllTransactionsRaw(): Promise<Transaction[]> {
  return withStore('readonly', (store) => store.getAll());
}

export async function bulkAddTransactions(transactions: Transaction[]): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const t of transactions) store.put(t);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * One-time migration: if there's data sitting in the old localStorage key
 * (from before IndexedDB was used) and the new database is empty, move it
 * over and remove the old copy so it isn't silently duplicated or orphaned.
 */
async function migrateFromLocalStorageIfNeeded(): Promise<void> {
  let legacyRaw: string | null = null;
  try {
    legacyRaw = localStorage.getItem(LEGACY_LOCALSTORAGE_KEY);
  } catch {
    return;
  }
  if (!legacyRaw) return;

  const existing = await getAllTransactionsRaw();
  if (existing.length > 0) {
    try {
      localStorage.removeItem(LEGACY_LOCALSTORAGE_KEY);
    } catch {
      // ignore
    }
    return;
  }

  try {
    const legacyTransactions: Transaction[] = JSON.parse(legacyRaw);
    if (Array.isArray(legacyTransactions) && legacyTransactions.length > 0) {
      await bulkAddTransactions(legacyTransactions);
    }
    localStorage.removeItem(LEGACY_LOCALSTORAGE_KEY);
  } catch {
    // Malformed legacy data — leave it alone rather than losing it silently.
  }
}

let migrationPromise: Promise<void> | null = null;
function migrateOnce(): Promise<void> {
  if (!migrationPromise) {
    migrationPromise = migrateFromLocalStorageIfNeeded();
  }
  return migrationPromise;
}

export async function getAllTransactions(): Promise<Transaction[]> {
  await migrateOnce();
  return getAllTransactionsRaw();
}

export async function putTransaction(transaction: Transaction): Promise<void> {
  await withStore('readwrite', (store) => store.put(transaction));
}

export async function deleteTransactionFromDb(id: string): Promise<void> {
  await withStore('readwrite', (store) => store.delete(id));
}

/** Test-only helper: closes the connection, wipes the database, and resets internal state. */
export async function resetTransactionsDbForTests(): Promise<void> {
  migrationPromise = null;
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });
}
